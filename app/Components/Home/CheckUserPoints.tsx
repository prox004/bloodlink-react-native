import React, { useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../Auth/config/firebase'; // Adjust the paths as needed for your Firebase imports

const CheckUserPoints: React.FC = () => {
  useEffect(() => {
    const checkAndSetPoints = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Reference to the user document
        const userDoc = await getDoc(userDocRef); // Fetch the document

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if `points` is not initialized
          if (userData.points === undefined) {
            try {
              // Set `points` to 0
              await updateDoc(userDocRef, { points: 0 });
              console.log('Points initialized to 0 for user:', user.uid);
            } catch (error) {
              console.error('Error initializing points:', error);
            }
          } else {
            console.log('Points already exist:', userData.points);
          }
        } else {
          console.warn('User document does not exist for:', user.uid);
        }
      } else {
        console.warn('No user is currently logged in.');
      }
    };

    checkAndSetPoints();
  }, []);

  return null; // This component doesn't render anything
};

export default CheckUserPoints;
