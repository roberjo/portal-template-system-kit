import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentDetailsView } from '@/features/documents/components/DocumentDetailsView';

const DocumentDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Missing document ID</div>;
  }
  
  return <DocumentDetailsView documentId={id} />;
};

export default DocumentDetails;