import React from 'react';
import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';

const Users = observer(() => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Outlet />
    </div>
  );
});

export default Users; 