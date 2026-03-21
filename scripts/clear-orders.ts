
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing all client orders...');

    // Delete in order to respect foreign key constraints
    // OrderItem and Payment usually reference Order, so they might be deleted via Cascade, 
    // but explicitly deleting them is safer/clearer.

    // Note: key constraints usually require deleting 'Order' last if Cascade is not set up, 
    // or 'OrderItem'/'Payment' first.
    // Looking at schema:
    // OrderItem -> Order (onDelete: Cascade)
    // Payment -> Order (no cascade mentioned in the snippet I saw, wait, let me re-check)

    // Schema check:
    // model Payment { order Order @relation(fields: [orderId], references: [id]) } -> No onDelete: Cascade shown in the previous view, 
    // actually I should check if I missed it. 
    // Payment usually has a unique orderId. 

    // Let's delete Payment and OrderItem first, then Order.

    try {
        const deletedPayments = await prisma.payment.deleteMany({});
        console.log(`Deleted ${deletedPayments.count} payments.`);

        const deletedOrderItems = await prisma.orderItem.deleteMany({});
        console.log(`Deleted ${deletedOrderItems.count} order items.`);

        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`Deleted ${deletedOrders.count} orders.`);

        console.log('All client orders have been cleared.');
    } catch (error) {
        console.error('Error clearing orders:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
