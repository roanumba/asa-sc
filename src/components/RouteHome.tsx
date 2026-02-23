import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { store } from "../";

export const RouteHome = () => {

   const history = useHistory();
   const location = useLocation();

   useEffect(() => {
      (async () => {
         // Skip date-based routing for admin pages, preview, form, and last page
         if (location.pathname.startsWith('/admin') ||
             location.pathname.startsWith('/preview') ||
             location.pathname === '/formViewPage' ||
             location.pathname === '/lastViewPage') {
            return;
         }

         await store.init();
      const today = dayjs();
      if (today.isAfter(dayjs(store.CLOSING_DATE).add(24, 'hours'))) {
         history.push('/closedPage');
         return;
      }
      if (today.isBefore(dayjs(store.OPENING_DATE))) {
         history.push('/openingPage');
         return;
      }

      history.push('/');
   })();

   }, []);
   return (
      <div />
   );
};