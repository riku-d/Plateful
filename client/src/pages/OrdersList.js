import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaTimes, FaCheck, FaClock, FaMapMarkerAlt, FaTruck, FaWalking } from 'react-icons/fa';

const OrdersList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/user');
        const data = await response.json();
        
        if (response.ok) {
          setOrders(data);
        } else {
          toast.error(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the order status locally
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        toast.success('Order cancelled successfully');
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Something went wrong. Please try again later.');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'ready', 'in-transit'].includes(order.status);
    } else if (activeTab === 'completed') {
      return order.status === 'completed' || order.status === 'delivered';
    } else {
      return order.status === 'cancelled';
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pending</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Confirmed</span>;
      case 'ready':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Ready for Pickup</span>;
      case 'in-transit':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">In Transit</span>;
      case 'delivered':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Delivered</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`${activeTab === 'active' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`${activeTab === 'cancelled' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Cancelled
          </button>
        </nav>
      </div>
      
      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{order.donation.title}</h2>
                    <p className="text-sm text-gray-500">Order #{order._id.substring(order._id.length - 8)}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="mr-2">
                    {order.orderType === 'delivery' ? (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <FaTruck className="mr-1" /> Delivery
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        <FaWalking className="mr-1" /> Pickup
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {order.orderType === 'pickup' ? (
                    <>
                      <div className="flex items-start">
                        <FaClock className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pickup Time</p>
                          <p className="text-sm text-gray-600">{order.pickupTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pickup Location</p>
                          <p className="text-sm text-gray-600">{order.donation.pickupLocation?.address || 'Address not available'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start">
                        <FaClock className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryTime ? new Date(order.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'To be determined'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryAddress ? 
                              `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}` : 
                              'Address not available'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Quantity</p>
                    <p className="text-sm text-gray-600">{order.quantity} {order.donation.quantityUnit}</p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link 
                    to={`/order/${order.donation._id}`} 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    <FaEye className="mr-1.5" />
                    View Details
                  </Link>
                  
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button 
                      onClick={() => handleCancelOrder(order._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:bg-red-200 transition ease-in-out duration-150"
                    >
                      <FaTimes className="mr-1.5" />
                      Cancel Order
                    </button>
                  )}
                  
                  {order.status === 'ready' && order.orderType === 'pickup' && (
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/orders/${order._id}/complete`, {
                            method: 'PUT'
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            setOrders(prevOrders => 
                              prevOrders.map(o => 
                                o._id === order._id ? { ...o, status: 'completed' } : o
                              )
                            );
                            toast.success('Order marked as completed');
                          } else {
                            toast.error(data.message || 'Failed to update order');
                          }
                        } catch (error) {
                          console.error('Error updating order:', error);
                          toast.error('Something went wrong. Please try again later.');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:border-green-300 focus:shadow-outline-green active:bg-green-200 transition ease-in-out duration-150"
                    >
                      <FaCheck className="mr-1.5" />
                      Mark as Picked Up
                    </button>
                  )}
                  
                  {order.status === 'in-transit' && order.orderType === 'delivery' && (
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status: 'delivered' })
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            setOrders(prevOrders => 
                              prevOrders.map(o => 
                                o._id === order._id ? { ...o, status: 'delivered' } : o
                              )
                            );
                            toast.success('Order marked as delivered');
                          } else {
                            toast.error(data.message || 'Failed to update order');
                          }
                        } catch (error) {
                          console.error('Error updating order:', error);
                          toast.error('Something went wrong. Please try again later.');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:border-green-300 focus:shadow-outline-green active:bg-green-200 transition ease-in-out duration-150"
                    >
                      <FaCheck className="mr-1.5" />
                      Confirm Delivery
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No {activeTab} orders found</h2>
          {activeTab === 'active' && (
            <div>
              <p className="text-gray-600 mb-4">You don't have any active orders at the moment.</p>
              <Link 
                to="/order-food" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Browse Available Food
              </Link>
            </div>
          )}
          {activeTab === 'completed' && (
            <p className="text-gray-600">You don't have any completed orders yet.</p>
          )}
          {activeTab === 'cancelled' && (
            <p className="text-gray-600">You don't have any cancelled orders.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList;