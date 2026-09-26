import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react';

const CarDetails = () => {

  const {id} = useParams()

  const {cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, user, setAuthRole, setShowLogin } = useAppContext()

  const navigate = useNavigate()
  const[car, setCar] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const currency = import.meta.env.VITE_CURRENCY || '₹'

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Razorpay checkout could not be loaded'))
    document.body.appendChild(script)
  })

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const {data} = await axios.post('/api/bookings/create-order', {
        car: id,
        pickupDate,
        returnDate
      })

      if (!data.success) return toast.error(data.message)

      await loadRazorpay()
      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'VehicleHub',
        description: `${car.brand} ${car.model} booking`,
        order_id: data.order.id,
        prefill: { name: user?.name, email: user?.email },
        method: {
          card: true,
          netbanking: true,
          upi: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        handler: async (response) => {
          const verification = await axios.post('/api/bookings/verify-payment', response)
          if (verification.data.success) {
            toast.success(verification.data.message)
            navigate('/my-bookings')
          } else {
            toast.error(verification.data.message)
          }
        },
        modal: { ondismiss: () => toast.error('Payment was cancelled') },
        theme: { color: '#2563eb' },
      })
      checkout.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed')
      })
      checkout.open()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  useEffect(() =>{
    const selectedCar = cars.find(car => car._id === id)
    setCar(selectedCar)
    setSelectedImage(selectedCar?.images?.[0] || selectedCar?.image || '')
  }, [cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
    
      <button onClick={() => navigate('/cars')} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt='' className='rotate-180 opacity-65'/>
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}

        className='lg:col-span-2'>
           <motion.img 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}

           src={selectedImage || car.image} alt={`${car.brand} ${car.model}`} className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-4 shadow-md'/>
           {(car.images?.length > 0 || car.image) && (
             <div className='flex flex-wrap gap-3 mb-6'>
               {(car.images?.length > 0 ? car.images : [car.image]).map((image, index) => (
                 <button
                   type='button'
                   key={`${image}-${index}`}
                   onClick={() => setSelectedImage(image)}
                   className={`rounded-lg overflow-hidden border-2 ${selectedImage === image ? 'border-primary' : 'border-transparent'}`}
                 >
                   <img src={image} alt={`${car.brand} ${car.model} photo ${index + 1}`} className='h-20 w-28 object-cover'/>
                 </button>
               ))}
             </div>
           )}
           <motion.div className='space-y-6'
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2, duration: 0.5 }}
           >
              <div>
                  <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
                  <p className='text-gray-500 text-lg'>{car.category} · {car.year}</p>
              </div>
              <hr className='border-borderColor my-6'/>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                {[
                  {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                  {icon: assets.fuel_icon, text: car.fuel_type},
                  {icon: assets.car_icon, text: car.transmission},
                  {icon: assets.location_icon, text: car.location},
                ].map(({icon, text})=>(
                  <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                    <img src={icon} alt="" className='h-5 mb-2'/>
                    {text}
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h1 className='text-xl font-medium mb-3'>Description</h1>
                <p className='text-gray-500'>{car.description}</p>
              </div>

              {/* features */}
              <div>
                <h1 className='text-xl font-medium mb-3'>Features</h1>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {
                    ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item)=>(
                      <li key={item} className='flex items-center text-gray-500'>
                        <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                        {item}
                      </li>
                    ))
                  }
                </ul>
              </div>

           </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.form 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}

        onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>

            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className=' text-base text-gray-800 font-normal'> per day</span></p>

            <hr className='border-borderColor my-6'/>

            <div className='flex flex-col gap-2'>
              <label htmlFor="pickup-date">Pickup Date</label>
              <input value={pickupDate} onChange={(e)=>setPickupDate(e.target.value)} 
              type="date" className='border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]}/>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="return-date">Return Date</label>
              <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)}  type="date" className='border-borderColor px-3 py-2 rounded-lg' required id='return-date'/>
            </div>

            <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>

            <p className='text-center text-sm'>Pay securely by card, UPI, net banking, wallet, or EMI</p>


        </motion.form>
      </div>

    </div>
  ) :  <Loader /> 
}

export default CarDetails