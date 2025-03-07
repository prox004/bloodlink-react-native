import {AnimationObject} from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  description?: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/animations/Lottie1.json'),
    text: 'Welcome To BloodLink',
    description: 'BloodLink is a platform that connects blood donors with blood recipients at the ease of a click. Find blood donors near you and save lives.',
    textColor: '#005b4f',
    backgroundColor: '#fcfcfc',
  },
  {
    id: 2,
    animation: require('../assets//animations/Lottie2.json'),
    text: 'Find Donors Near You',
    description:'Easily locate blood donors near you and get in touch with them. BloodLink makes it easy to find blood donors and save lives.',
    textColor: 'white',
    backgroundColor: '#bb3f3f',
  },
  {
    id: 3,
    animation: require('../assets//animations/Lottie4.json'),
    text: 'Easily Track Donation',
    description: 'Track your blood donations and get notified when your blood is used to save a life. BloodLink makes it easy to track your donations.',
    textColor: '#blue',
    backgroundColor: '#fcfcfc',
  },
];

export default data;
