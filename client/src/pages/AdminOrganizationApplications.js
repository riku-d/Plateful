import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FaBuilding, 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf,
  FaEye,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const AdminOrganizationApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewNotes: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organization-applications', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load organization applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setReviewData({
      status: '',
      reviewNotes: ''
    });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.status) {
      toast.error('Please select a status (Approve or Reject)');
      return;
    }

    if (!reviewData.reviewNotes) {
      toast.error('Please provide review notes');
      return;
    }

    try {
      setReviewLoading(true);
      const response = await fetch(`/api/organization-applications/${selectedApplication._id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to review application');
      }

      toast.success(`Application ${reviewData.status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error(error.message || 'Failed to review application');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaHourglassHalf className="mr-1" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaBuilding className="mr-3 text-blue-600" />
            Organization Applications
          </h1>
          <p className="mt-2 text-gray-600">
            Review and manage organization applications
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">There are no organization applications to review at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {application.logo ? (
                              <img src={application.logo} alt="Logo" className="h-10 w-10 rounded-full" />
                            ) : (
                              <FaBuilding className="text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{application.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.applicant?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{application.applicant?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                        {application.status !== 'pending' && (
                          <div className="text-sm text-gray-500 mt-1">
                            By: {application.reviewedBy?.name || 'Unknown'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                handleViewApplication(application);
                                setReviewData({ status: 'approved', reviewNotes: 'Application meets our requirements.' });
                              }}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <FaCheck className="inline mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                handleViewApplication(application);
                                setReviewData({ status: 'rejected', reviewNotes: '' });
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="inline mr-1" /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedApplication.status === 'pending' ? 'Review Application' : 'Application Details'}
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.name}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-base text-gray-900 mb-3">
                      {selectedApplication.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.description}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Services</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedApplication.services && selectedApplication.services.length > 0 ? (
                        selectedApplication.services.map((service, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No services specified</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.contact?.email || 'Not provided'}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.contact?.phone || 'Not provided'}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.contact?.website || 'Not provided'}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-base text-gray-900">
                      {selectedApplication.address?.street ? (
                        <>
                          {selectedApplication.address.street}<br />
                          {selectedApplication.address.city}, {selectedApplication.address.state} {selectedApplication.address.zipCode}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Applicant Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base text-gray-900 mb-3">{selectedApplication.applicant?.name || 'Unknown'}</p>
                  
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900 mb-3">{selectedApplication.applicant?.email || 'Unknown'}</p>
                  
                  <p className="text-sm font-medium text-gray-500">Application Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedApplication.createdAt).toLocaleDateString()} at {new Date(selectedApplication.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {selectedApplication.status !== 'pending' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-base mb-3">{getStatusBadge(selectedApplication.status)}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Reviewed By</p>
                    <p className="text-base text-gray-900 mb-3">{selectedApplication.reviewedBy?.name || 'Unknown'}</p>
                    
                    <p className="text-sm font-medium text-gray-500">Review Date</p>
                    <p className="text-base text-gray-900 mb-3">
                      {selectedApplication.reviewedAt ? new Date(selectedApplication.reviewedAt).toLocaleDateString() : 'Not available'}
                    </p>
                    
                    <p className="text-sm font-medium text-gray-500">Review Notes</p>
                    <p className="text-base text-gray-900">{selectedApplication.reviewNotes || 'No notes provided'}</p>
                  </div>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <form onSubmit={handleReviewSubmit}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Application</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="approved"
                          checked={reviewData.status === 'approved'}
                          onChange={handleReviewChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Approve</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="rejected"
                          checked={reviewData.status === 'rejected'}
                          onChange={handleReviewChange}
                          className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-2 text-gray-700">Reject</span>
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      id="reviewNotes"
                      name="reviewNotes"
                      rows={4}
                      value={reviewData.reviewNotes}
                      onChange={handleReviewChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={reviewData.status === 'approved' ? 'Reason for approval' : 'Reason for rejection'}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedApplication(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${reviewData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : reviewData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {reviewLoading ? (
                        <>
                          <FaSpinner className="animate-spin inline mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Submit ${reviewData.status === 'approved' ? 'Approval' : reviewData.status === 'rejected' ? 'Rejection' : 'Review'}`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizationApplications;