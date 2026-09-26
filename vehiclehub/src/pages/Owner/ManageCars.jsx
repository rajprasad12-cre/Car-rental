import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import EditCar from './EditCar'

const ManageCars = () => {

  const {isOwner, axios, currency} = useAppContext()

  const [cars, setCars] = useState([])
  const [editingCar, setEditingCar] = useState(null)

  const fetchOwnerCars = async () => {
    try {
      const {data} = await axios.get('/api/owner/car')
      if(data.success) {
        setCars(data.cars)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const toggleAvailability = async (carId) => {
    try {
      const {data} = await axios.post('/api/owner/toggle-car', { carId })
      if(data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId) => {
    try {

      const confirm = window.confirm('Are you sure you want to delete this car?')

      if(!confirm) return null

      const {data} = await axios.post('/api/owner/delete-car', { carId })
      if(data.success){
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    isOwner &&  fetchOwnerCars()
  }, [isOwner])

  return (
    <>
    <div className='px-4 py-10 md:px-10 flex-1'>
      <div className='text-left'>
        <h1 className='text-2xl font-semibold text-gray-800 dark:text-gray-200'>Manage Cars</h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>View all listed cars, update their details, or remove them from the booking platform.</p>
      </div>

      <div className='mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
        <div className='overflow-x-auto'>
        <div className='min-w-[720px]'>
        <div className='grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300'>
          <div>Car</div>
          <div>Category</div>
          <div>Price</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {cars.map((car) => (
          <div key={car._id} className='grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-sm last:border-b-0'>
            <div className='flex items-center gap-3'>
              <img src={car.image} alt='' className='h-12 w-12 rounded object-cover' />
              <div>
                <p className='font-medium text-gray-800 dark:text-gray-200'>{car.brand} {car.model}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>{car.year}</p>
              </div>
            </div>
            <div className='text-gray-600 dark:text-gray-300'>{car.category}</div>
            <div className='text-gray-600 dark:text-gray-300'>₹{car.pricePerDay}</div>
            <div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${car.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                {car.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <button type='button' onClick={() => setEditingCar(car)} className='rounded border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary dark:bg-primary/20 dark:text-blue-300'>
                Edit
              </button>
              <button type='button' onClick={() => toggleAvailability(car._id)} className='rounded border border-primary/30 bg-primary/10 p-2 text-primary dark:bg-primary/20 dark:text-blue-300' aria-label='Toggle availability'>
                <img src={assets.eye_icon} alt='' className='h-4 w-4' />
              </button>
              <button type='button' onClick={() => deleteCar(car._id)} className='rounded border border-red-500/30 bg-red-500/10 p-2 text-red-600 dark:bg-red-500/20 dark:text-red-300' aria-label='Delete car'>
                <img src={assets.delete_icon} alt='' className='h-4 w-4' />
              </button>
            </div>
          </div>
        ))}
        </div>
        </div>
      </div>
    </div>
    {editingCar && (
      <EditCar
        car={editingCar}
        onClose={() => setEditingCar(null)}
        onSaved={() => {
          setEditingCar(null)
          fetchOwnerCars()
        }}
      />
    )}
    </>
  )
}

export default ManageCars