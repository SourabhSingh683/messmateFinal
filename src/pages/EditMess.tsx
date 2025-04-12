
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ManageMess from './ManageMess';

const EditMess = () => {
  const { messId } = useParams<{ messId: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return <ManageMess />;
};

export default EditMess;
