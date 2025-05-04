import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentDetailsView } from '../components/DocumentDetailsView';

const DocumentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Document ID not found</div>;
  }
  
  return <DocumentDetailsView documentId={id} />;
};

export default DocumentDetailsPage; 