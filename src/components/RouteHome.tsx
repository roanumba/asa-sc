import moment from 'moment';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { store } from "../";

export const RouteHome = () => {
   
   const history = useHistory();
   useEffect(() => {
      (async () => {
         await store.init();
      const today = moment();
      if (today.isAfter(moment(store.CLOSING_DATE).add(24, 'hours'))) {
         history.push('/closedPage');
         return;
      }
      if (today.isBefore(moment(store.OPENING_DATE))) {
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