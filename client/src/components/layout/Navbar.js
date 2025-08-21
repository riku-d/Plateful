import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { 
  FaHome, 
  FaHandHoldingHeart, 
  FaClipboardList, 
  FaBuilding, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
  FaBell
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Navigation links - All authenticated users can view
  const navLinks = [
    { to: '/', label: 'Home', icon: FaHome },
    { to: '/donations', label: 'Browse Donations', icon: FaHandHoldingHeart },
    { to: '/community', label: 'Community', icon: FaClipboardList },
    { to: '/organizations', label: 'Organizations', icon: FaBuilding },
    { to: '/analytics', label: 'Analytics', icon: FaChartBar },
    { to: '/notifications', label: 'Notifications', icon: FaBell },
  ];

  // Role-based user menu items
  const getUserMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { to: '/dashboard', label: 'Dashboard', icon: FaUser },
      { to: '/profile', label: 'Profile', icon: FaUser },
    ];

    // Role-specific items
    switch (user.role) {
      case 'donor':
        baseItems.push({
          to: '/donations/create',
          label: 'Donate Food',
          icon: FaHandHoldingHeart,
          description: 'Share your excess food'
        });
        break;
      
      case 'recipient':
        baseItems.push(
          {
            to: '/requests/create',
            label: 'Request Food',
            icon: FaClipboardList,
            description: 'Ask for food assistance'
          },
          {
            to: '/donations/reserved',
            label: 'My Reserved Donations',
            icon: FaHandHoldingHeart,
            description: 'View donations you have reserved'
          },
          {
            to: '/orders',
            label: 'My Orders',
            icon: FaClipboardList,
            description: 'View your food orders'
          }
        );
        break;
      
      case 'volunteer':
        baseItems.push(
          {
            to: '/donations/create',
            label: 'Donate Food',
            icon: FaHandHoldingHeart,
            description: 'Share food on behalf of others'
          },
          {
            to: '/organizations/create',
            label: 'Add Organization',
            icon: FaBuilding,
            description: 'Register new food banks/shelters'
          }
        );
        break;
      
      case 'admin':
        baseItems.push(
          {
            to: '/admin',
            label: 'Admin Dashboard',
            icon: FaUser,
            description: 'Access admin control panel'
          },
          {
            to: '/donations/create',
            label: 'Create Donation',
            icon: FaHandHoldingHeart,
            description: 'Admin donation management'
          },
          {
            to: '/requests/create',
            label: 'Create Request',
            icon: FaClipboardList,
            description: 'Admin request management'
          },
          {
            to: '/organizations/create',
            label: 'Add Organization',
            icon: FaBuilding,
            description: 'Register new organizations'
          }
        );
        break;
      
      default:
        break;
    }

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaHandHoldingHeart className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900">Plateful</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <NotificationDropdown />
            )}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                  <FaUser className="w-4 h-4" />
                  <span>{user?.name}</span>
                  <span className="text-xs bg-primary-700 px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-start space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <div className="px-3 py-2 text-sm text-gray-500">
                    <span className="font-medium">Role: {user?.role}</span>
                  </div>
                  <div className="px-3 py-2">
                    <NotificationDropdown />
                  </div>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-start space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div>{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
