import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHandHoldingHeart, 
  FaClipboardList, 
  FaBuilding, 
  FaUsers, 
  FaLeaf, 
  FaGlobe,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FaHandHoldingHeart,
      title: 'Food Donations',
      description: 'Easily donate excess food to those in need. Reduce waste and help your community.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: FaClipboardList,
      title: 'Food Requests',
      description: 'Request specific food items you need. Connect with donors in your area.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FaBuilding,
      title: 'Organizations',
      description: 'Find and connect with local food banks, shelters, and community organizations.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'Build a network of food donors, recipients, and volunteers in your area.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Meals Saved' },
    { number: '5,000+', label: 'Active Users' },
    { number: '500+', label: 'Organizations' },
    { number: '100+', label: 'Cities Served' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Food Donor',
      content: 'Food Ranger made it so easy to donate our excess food. We feel good knowing it\'s helping families in need.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Community Center Director',
      content: 'This platform has transformed how we source food for our community programs. It\'s a game-changer.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Volunteer',
      content: 'I love being able to coordinate food pickups and deliveries. The app makes everything so organized.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/bg.jpg')" }} // replace with your image path
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
              Zero Waste, All Taste
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
              Connect food donors with those in need. Reduce waste, fight hunger, and build stronger communities together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/donations"
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Browse Donations
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/donations/create"
                    className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Donate Food
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes it simple to connect food donors with recipients, creating a sustainable food ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Together, we're making a real difference in communities across the country.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What People Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our community members about their experience with Food Ranger.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of people who are already helping to reduce food waste and feed their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Join Food Ranger
                </Link>
                <Link
                  to="/donations"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Explore Donations
                </Link>
              </>
            ) : (
              <Link
                to="/donations/create"
                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center"
              >
                Start Donating Today
                <FaArrowRight className="ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Plateful</h3>
              <p className="text-gray-400">
                We're on a mission to reduce food waste and hunger by connecting communities through technology.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/donations" className="hover:text-white transition-colors">Browse Donations</Link></li>
                <li><Link to="/requests" className="hover:text-white transition-colors">View Requests</Link></li>
                <li><Link to="/organizations" className="hover:text-white transition-colors">Find Organizations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/donations/create" className="hover:text-white transition-colors">Donate Food</Link></li>
                <li><Link to="/organizations/create" className="hover:text-white transition-colors">Create Organization</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Plateful.All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
