import moment from 'moment';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
export const RouteHome = () => {
   const history = useHistory();
    useEffect(() => {
      const today=moment();
      
        history.push('/');

    }, []);
    return (
       <div/>
    );
    };