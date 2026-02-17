import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { store } from "../";

export const RouteHome = () => {

   const history = useHistory();
   useEffect(() => {
      (async () => {
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