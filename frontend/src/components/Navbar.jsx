
import {useState} from 'react';

export default function Navbar({onSearch, setUser}){
 const [q, setQ] = useState('');
 
 const handleSearch = () => {
  if(onSearch) onSearch(q);
 };

 const handleKeyPress = (e) => {
  if(e.key === 'Enter') handleSearch();
 };

 const handleInputChange = (e) => {
  const value = e.target.value;
  setQ(value);
  // If input is cleared, automatically show all videos
  if(value === '' && onSearch) {
   onSearch('');
  }
 };

 return (
  <nav className='navbar'>
   <div className='navbar-left'>
    <div className='logo'>▶ YouTube Clone</div>
   </div>
   <div className='navbar-center'>
    <div className='search-container'>
     <input 
      type='text'
      className='search-input'
      placeholder='Search videos...' 
      value={q}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
     />
     <button className='search-btn' onClick={handleSearch}>🔍</button>
    </div>
   </div>
   <div className='navbar-right'>
   </div>
  </nav>
 );
}
