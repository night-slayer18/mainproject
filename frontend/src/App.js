import Navbar from './components/Navbar';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Upload from './components/Upload';
const App = () => {
  const uploadSuccess = () => toast.success('Files uploaded successfully');
  const uploadError = () => toast.error('File upload failed. Please try again.');
  const errorOccurred = () => toast.error('An error occurred. Please try again.');

  return (
    <>
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/upload" element={<Upload/>} uploadSuccess={uploadSuccess} uploadError={uploadError} errorOccurred={errorOccurred} />
      </Routes>
      <Toaster/>
    </BrowserRouter>
    </>
  );
};

export default App;
