import React from 'react';
import { Mail, Phone, MapPin, Clock, Heart, Star, Award, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export function AboutUs() {
  const { state } = useApp();
  const { adminSettings } = state;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About YH Pecklech</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            For Any Occasion, To Suit Every Budget
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/6205509/pexels-photo-6205509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Our Story" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  YH Pecklech was founded with a simple mission: to provide beautiful, high-quality gift packages for all Jewish celebrations and occasions. What started as a small family business has grown into a trusted name in the community.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We understand the importance of tradition and the joy of giving. That's why we put so much care into every Pecklech we create, ensuring that each one is perfect for its intended occasion.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, we're proud to serve customers across the community with our wide range of options, from ready-to-go packages to fully customized creations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-brand-teal" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality & Care</h3>
              <p className="text-gray-600">
                We select only the finest items for our Pecklech, ensuring that every package meets our high standards of quality and presentation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-brand-teal" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tradition & Innovation</h3>
              <p className="text-gray-600">
                We honor Jewish traditions while embracing modern designs and creative approaches to make each Pecklech special.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-brand-teal" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Focus</h3>
              <p className="text-gray-600">
                We're deeply rooted in our community and committed to serving our customers with excellence and care.
              </p>
              <p className="text-gray-600 mt-4">
                Email: {adminSettings.contactEmail || 'info@yhpecklech.com'}<br />
                Phone: {adminSettings.contactPhone || '+44 20 1234 5678'}
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-3xl shadow-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose YH Pecklech?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl">
                <Award className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  We source the highest quality items for all our Pecklech, ensuring your gift makes the perfect impression.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl">
                <Star className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customization</h3>
                <p className="text-gray-600">
                  From ready-made options to fully customized packages, we offer flexibility to suit your specific needs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Timely Delivery</h3>
                <p className="text-gray-600">
                  We understand the importance of timing for special occasions and ensure your Pecklech arrive when needed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl">
                <Heart className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Touch</h3>
                <p className="text-gray-600">
                  Each Pecklech is prepared with attention to detail and a personal touch that makes it truly special.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-lime rounded-3xl shadow-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Get In Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Mail className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-primary-100">info@yhpecklech.com</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <Phone className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-primary-100">+44 20 1234 5678</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <MapPin className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-primary-100">123 Main Street, London, NW1 6XE</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/contact" className="inline-block bg-white text-brand-teal px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}