module.exports = (io) => {
  // Online users tracking
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room based on role
    socket.on('join', ({ userId, role }) => {
      socket.join(userId);
      socket.join(`role:${role}`);
      onlineUsers.set(userId, socket.id);

      // Emit online count to admins
      io.to('role:admin').emit('onlineCount', onlineUsers.size);
    });

    // New order notification → notify admin + finance
    socket.on('newOrder', (order) => {
      io.to('role:admin').emit('orderUpdate', { type: 'new', order });
      if (['easypaisa','jazzcash'].includes(order.paymentMethod)) {
        io.to('role:finance').emit('orderUpdate', { type: 'new', order });
      }
    });

    // Payment proof uploaded → notify finance
    socket.on('proofUploaded', (data) => {
      io.to('role:finance').emit('paymentUpdate', { type: 'proof', ...data });
      io.to('role:admin').emit('paymentUpdate', { type: 'proof', ...data });
    });

    // Payment verified/rejected → notify customer
    socket.on('paymentVerified', ({ customerId, orderId, status }) => {
      io.to(customerId).emit('paymentUpdate', { status, orderId });
    });

    // Order status update → notify customer
    socket.on('orderStatusUpdate', ({ customerId, order }) => {
      io.to(customerId).emit('orderUpdate', { type: 'statusChange', order });
    });

    // New support ticket → notify support team
    socket.on('newTicket', (ticket) => {
      io.to('role:support').emit('ticketUpdate', { type: 'new', ticket });
    });

    // Low stock alert → notify admin + inventory
    socket.on('lowStock', (product) => {
      io.to('role:admin').emit('inventoryAlert', product);
      io.to('role:staff').emit('inventoryAlert', product);
    });

    // Admin dashboard broadcast
    socket.on('dashboardUpdate', (data) => {
      io.to('role:admin').emit('statsUpdate', data);
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((sockId, userId) => {
        if (sockId === socket.id) onlineUsers.delete(userId);
      });
      io.to('role:admin').emit('onlineCount', onlineUsers.size);
      console.log('User disconnected:', socket.id);
    });
  });
};
