import React from 'react';
import { useParams } from 'react-router-dom';

const RequestDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Request Detail Page</h2>
        <p className="mt-2 text-gray-600">Viewing request ID: {id}</p>
        <p className="mt-4 text-sm text-gray-500">This page will show detailed information about the request</p>
      </div>
    </div>
  );
};

export default RequestDetail;
