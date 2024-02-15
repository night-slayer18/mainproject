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
  const upError = () => toast.error('File upload failed. Please try again.');
  const errorOccurred = () => toast.error('An error occurred. Please try again.');
  const uploadClear = () => toast.success('Files cleared successfully');

  return (
    <>
    <BrowserRouter>
      <Toaster/>
      <Navbar/>
      <Routes>
        <Route path="/upload" element={<Upload uploadSuccess={uploadSuccess} upError={upError} errorOccurred={errorOccurred} uploadClear={uploadClear}/>} />
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
