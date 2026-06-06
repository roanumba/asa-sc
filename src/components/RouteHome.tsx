import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { store } from "../";

export const RouteHome = () => {

   const history = useHistory();
   const location = useLocation();

   useEffect(() => {
      (async () => {
         await store.init();
         const today = dayjs();
         // Skip redirect for admin routes
         if (location.pathname.startsWith('/admin')) {
            return;
         }

         const isClosed = today.isAfter(dayjs(store.CLOSING_DATE).add(24, 'hours'));
         const isNotOpenedYet = today.isBefore(dayjs(store.OPENING_DATE));

         if (isClosed) {
            if (location.pathname !== '/closedPage') {
               history.push('/closedPage');
            }
            return;
         }
         if (isNotOpenedYet) {
            if (location.pathname !== '/openingPage') {
               history.push('/openingPage');
            }
            return;
         }
         
         // If application is active, redirect away from opening/closed status pages
         if (location.pathname === '/openingPage' || location.pathname === '/closedPage') {
            history.push('/');
         }
      })();

   }, [location.pathname]);
   return (
      <div />
   );
};