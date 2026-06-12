// "use client"

// import React, { useState } from 'react';
// import Login from "./login/page"
// import SignUp from './sign-up/page';

// type AuthModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
//   const [activeTab, setActiveTab] = useState('login');

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
//         <div className="flex justify-end p-2">
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//         <div className="flex border-b">
//           <button
//             className={`flex-1 py-4 font-medium text-center ${
//               activeTab === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'
//             }`}
//             onClick={() => setActiveTab('login')}
//           >
//             Login
//           </button>
//           <button
//             className={`flex-1 py-4 font-medium text-center ${
//               activeTab === 'register' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'
//             }`}
//             onClick={() => setActiveTab('register')}
//           >
//             Register
//           </button>
//         </div>
        
//         <div className="p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//             Metadata Explorer
//           </h2>
          
//           {activeTab === 'login' ? (
//             <Login />
//           ) : (
//             <SignUp />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthModal;