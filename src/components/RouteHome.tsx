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

         if (today.isAfter(dayjs(store.CLOSING_DATE).add(24, 'hours'))) {
            history.push('/closedPage');
            return;
         }
         if (today.isBefore(dayjs(store.OPENING_DATE))) {
            history.push('/openingPage');
            return;
         }
         
         // Only redirect to root if we are on a form page or similar,
         // but for now we'll leave it as it was:
         if (!location.pathname.startsWith('/preview') && !location.pathname.startsWith('/new-form') && !location.pathname.startsWith('/formViewPage') && location.pathname !== '/') {
             // Let it be, or keep existing logic
         }
      })();

   }, []);
   return (
      <div />
   );
};