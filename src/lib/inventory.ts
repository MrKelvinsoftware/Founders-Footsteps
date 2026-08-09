import { db } from "@/db";
import { products, services, orders, orderItems, bookings } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { sendOrderUpdateNotification, sendBookingUpdateNotification } from "./inbox";

// ============================================
// PRODUCT STOCK MANAGEMENT
// ============================================

export async function checkProductStock(productId: string, quantity: number): Promise<{
  available: boolean;
  currentStock: number;
  message: string;
}> {
  const [product] = await db
    .select({ stock: products.stock, name: products.name })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return { available: false, currentStock: 0, message: "Product not found" };
  }

  const currentStock = product.stock || 0;
  
  if (currentStock < quantity) {
    return {
      available: false,
      currentStock,
      message: `Only ${currentStock} items available for ${product.name}`,
    };
  }

  return { available: true, currentStock, message: "Stock available" };
}

export async function reduceProductStock(productId: string, quantity: number): Promise<{
  success: boolean;
  newStock: number;
  message: string;
}> {
  try {
    // Use atomic update with check
    const [updated] = await db
      .update(products)
      .set({
        stock: sql`GREATEST(0, ${products.stock} - ${quantity})`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, productId),
          gte(products.stock, quantity) // Only update if enough stock
        )
      )
      .returning({ stock: products.stock, name: products.name });

    if (!updated) {
      // Check if it's because of insufficient stock
      const [product] = await db
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      return {
        success: false,
        newStock: product?.stock || 0,
        message: "Insufficient stock",
      };
    }

    console.log(`[INVENTORY] Reduced stock for product ${productId}: -${quantity}, new stock: ${updated.stock}`);
    
    return {
      success: true,
      newStock: updated.stock || 0,
      message: `Stock reduced. ${updated.stock} remaining.`,
    };
  } catch (error) {
    console.error("[INVENTORY] Error reducing product stock:", error);
    return { success: false, newStock: 0, message: "Failed to update stock" };
  }
}

export async function restoreProductStock(productId: string, quantity: number): Promise<{
  success: boolean;
  newStock: number;
}> {
  try {
    const [updated] = await db
      .update(products)
      .set({
        stock: sql`${products.stock} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning({ stock: products.stock });

    console.log(`[INVENTORY] Restored stock for product ${productId}: +${quantity}, new stock: ${updated?.stock}`);
    
    return { success: true, newStock: updated?.stock || 0 };
  } catch (error) {
    console.error("[INVENTORY] Error restoring product stock:", error);
    return { success: false, newStock: 0 };
  }
}

// ============================================
// SERVICE SLOT MANAGEMENT
// ============================================

export async function checkServiceSlots(serviceId: string, slotsNeeded: number = 1): Promise<{
  available: boolean;
  currentSlots: number;
  maxSlots: number;
  message: string;
}> {
  const [service] = await db
    .select({ 
      availableSlots: services.availableSlots, 
      maxSlots: services.maxSlots,
      name: services.name 
    })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    return { available: false, currentSlots: 0, maxSlots: 0, message: "Service not found" };
  }

  const currentSlots = service.availableSlots || 0;
  const maxSlots = service.maxSlots || 10;
  
  if (currentSlots < slotsNeeded) {
    return {
      available: false,
      currentSlots,
      maxSlots,
      message: `Only ${currentSlots} slots available for ${service.name}`,
    };
  }

  return { 
    available: true, 
    currentSlots, 
    maxSlots,
    message: "Slots available" 
  };
}

export async function reduceServiceSlots(serviceId: string, slotsNeeded: number = 1): Promise<{
  success: boolean;
  newSlots: number;
  message: string;
}> {
  try {
    const [updated] = await db
      .update(services)
      .set({
        availableSlots: sql`GREATEST(0, ${services.availableSlots} - ${slotsNeeded})`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(services.id, serviceId),
          gte(services.availableSlots, slotsNeeded)
        )
      )
      .returning({ availableSlots: services.availableSlots, name: services.name });

    if (!updated) {
      const [service] = await db
        .select({ availableSlots: services.availableSlots })
        .from(services)
        .where(eq(services.id, serviceId))
        .limit(1);

      return {
        success: false,
        newSlots: service?.availableSlots || 0,
        message: "Insufficient slots available",
      };
    }

    console.log(`[INVENTORY] Reduced slots for service ${serviceId}: -${slotsNeeded}, new slots: ${updated.availableSlots}`);
    
    return {
      success: true,
      newSlots: updated.availableSlots || 0,
      message: `Slot booked. ${updated.availableSlots} remaining.`,
    };
  } catch (error) {
    console.error("[INVENTORY] Error reducing service slots:", error);
    return { success: false, newSlots: 0, message: "Failed to book slot" };
  }
}

export async function restoreServiceSlots(serviceId: string, slotsToRestore: number = 1): Promise<{
  success: boolean;
  newSlots: number;
}> {
  try {
    const [updated] = await db
      .update(services)
      .set({
        availableSlots: sql`LEAST(${services.maxSlots}, ${services.availableSlots} + ${slotsToRestore})`,
        updatedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning({ availableSlots: services.availableSlots });

    console.log(`[INVENTORY] Restored slots for service ${serviceId}: +${slotsToRestore}, new slots: ${updated?.availableSlots}`);
    
    return { success: true, newSlots: updated?.availableSlots || 0 };
  } catch (error) {
    console.error("[INVENTORY] Error restoring service slots:", error);
    return { success: false, newSlots: 0 };
  }
}

// ============================================
// ORDER PROCESSING WITH STOCK REDUCTION
// ============================================

export async function processOrderStock(orderId: string): Promise<{
  success: boolean;
  message: string;
  failedItems: string[];
}> {
  const failedItems: string[] = [];

  try {
    // Get all items in the order
    const items = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Check all stock first
    for (const item of items) {
      const check = await checkProductStock(item.productId, item.quantity);
      if (!check.available) {
        failedItems.push(item.productName || item.productId);
      }
    }

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `Insufficient stock for: ${failedItems.join(", ")}`,
        failedItems,
      };
    }

    // Reduce stock for all items
    for (const item of items) {
      const result = await reduceProductStock(item.productId, item.quantity);
      if (!result.success) {
        failedItems.push(item.productName || item.productId);
      }
    }

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `Failed to reduce stock for: ${failedItems.join(", ")}`,
        failedItems,
      };
    }

    // Update order status
    await db
      .update(orders)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    // Get order details for notification
    const [order] = await db
      .select({ userId: orders.userId, orderNumber: orders.orderNumber })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order) {
      await sendOrderUpdateNotification(order.userId, order.orderNumber, "confirmed");
    }

    console.log(`[INVENTORY] Order ${orderId} stock processed successfully`);
    
    return { success: true, message: "Order confirmed and stock reduced", failedItems: [] };
  } catch (error) {
    console.error("[INVENTORY] Error processing order stock:", error);
    return { success: false, message: "Failed to process order", failedItems };
  }
}

// ============================================
// BOOKING PROCESSING WITH SLOT REDUCTION
// ============================================

export async function processBookingSlot(bookingId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get booking details
    const [booking] = await db
      .select({
        serviceId: bookings.serviceId,
        userId: bookings.userId,
        bookingNumber: bookings.bookingNumber,
        serviceName: services.name,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    // Check slot availability
    const check = await checkServiceSlots(booking.serviceId);
    if (!check.available) {
      return { success: false, message: check.message };
    }

    // Reduce slot
    const result = await reduceServiceSlots(booking.serviceId);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    // Send notification
    await sendBookingUpdateNotification(
      booking.userId,
      booking.bookingNumber,
      "confirmed",
      booking.serviceName || "Service"
    );

    console.log(`[INVENTORY] Booking ${bookingId} slot processed successfully`);
    
    return { success: true, message: "Booking confirmed and slot reserved" };
  } catch (error) {
    console.error("[INVENTORY] Error processing booking slot:", error);
    return { success: false, message: "Failed to process booking" };
  }
}

// ============================================
// CANCELLATION HANDLERS
// ============================================

export async function cancelOrderAndRestoreStock(orderId: string, reason?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get order items
    const items = await db
      .select({ productId: orderItems.productId, quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Restore stock for each item
    for (const item of items) {
      await restoreProductStock(item.productId, item.quantity);
    }

    // Update order status
    const [order] = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning({ userId: orders.userId, orderNumber: orders.orderNumber });

    if (order) {
      await sendOrderUpdateNotification(order.userId, order.orderNumber, "cancelled", reason);
    }

    console.log(`[INVENTORY] Order ${orderId} cancelled and stock restored`);
    
    return { success: true, message: "Order cancelled and stock restored" };
  } catch (error) {
    console.error("[INVENTORY] Error cancelling order:", error);
    return { success: false, message: "Failed to cancel order" };
  }
}

export async function cancelBookingAndRestoreSlot(bookingId: string, reason?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get booking details
    const [booking] = await db
      .select({
        serviceId: bookings.serviceId,
        userId: bookings.userId,
        bookingNumber: bookings.bookingNumber,
        serviceName: services.name,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    // Restore slot
    await restoreServiceSlots(booking.serviceId);

    // Update booking status
    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    // Send notification
    await sendBookingUpdateNotification(
      booking.userId,
      booking.bookingNumber,
      "cancelled",
      booking.serviceName || "Service",
      reason
    );

    console.log(`[INVENTORY] Booking ${bookingId} cancelled and slot restored`);
    
    return { success: true, message: "Booking cancelled and slot restored" };
  } catch (error) {
    console.error("[INVENTORY] Error cancelling booking:", error);
    return { success: false, message: "Failed to cancel booking" };
  }
}

// ============================================
// DAILY SLOT RESET (for services with daily slots)
// ============================================

export async function resetDailySlots(): Promise<{
  success: boolean;
  servicesReset: number;
}> {
  try {
    const result = await db
      .update(services)
      .set({
        availableSlots: services.maxSlots,
        updatedAt: new Date(),
      })
      .returning({ id: services.id });

    console.log(`[INVENTORY] Reset daily slots for ${result.length} services`);
    
    return { success: true, servicesReset: result.length };
  } catch (error) {
    console.error("[INVENTORY] Error resetting daily slots:", error);
    return { success: false, servicesReset: 0 };
  }
}
