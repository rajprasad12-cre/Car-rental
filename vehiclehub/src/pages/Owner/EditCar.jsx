import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const EditCar = ({ car, onClose, onSaved }) => {
  const { axios, currency } = useAppContext()
  const [form, setForm] = useState({
    brand: car.brand || '',
    model: car.model || '',
    year: car.year || '',
    pricePerDay: car.pricePerDay || '',
    category: car.category || '',
    transmission: car.transmission || '',
    fuel_type: car.fuel_type || '',
    seating_capacity: car.seating_capacity || '',
    location: car.location || '',
    description: car.description || '',
  })
  const [existingImages, setExistingImages] = useState(car.images?.length ? car.images : [car.image])
  const [newImages, setNewImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('Keep at least one car image')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('carData', JSON.stringify(form))
      formData.append('existingImages', JSON.stringify(existingImages))
      newImages.forEach((image) => formData.append('image', image))

      const { data } = await axios.put(`/api/owner/car/${car._id}`, formData)
      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      onSaved()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4' onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(event) => event.stopPropagation()} className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800'>
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>Edit {car.brand} {car.model}</h2>
          <button type='button' onClick={onClose} className='text-2xl text-gray-500' aria-label='Close editor'>&times;</button>
        </div>

        <div className='mb-6'>
          <p className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-300'>Car photos</p>
          <div className='flex flex-wrap gap-3'>
            {existingImages.map((image, index) => (
              <div key={`${image}-${index}`} className='relative'>
                <img src={image} alt={`Car photo ${index + 1}`} className='h-24 w-32 rounded object-cover' />
                <button type='button' onClick={() => setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className='absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white' aria-label={`Remove photo ${index + 1}`}>Remove</button>
              </div>
            ))}
            {newImages.map((image, index) => (
              <div key={`${image.name}-${image.lastModified}`} className='relative'>
                <img src={URL.createObjectURL(image)} alt={image.name} className='h-24 w-32 rounded object-cover' />
                <button type='button' onClick={() => setNewImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className='absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white'>Remove</button>
              </div>
            ))}
            <label className='flex h-24 w-32 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 text-center text-xs text-gray-500'>
              Add photos
              <input type='file' accept='image/*' multiple hidden onChange={(event) => setNewImages((current) => [...current, ...Array.from(event.target.files || [])])} />
            </label>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <label>Brand<input required value={form.brand} onChange={(event) => updateField('brand', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Model<input required value={form.model} onChange={(event) => updateField('model', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Year<input required type='number' value={form.year} onChange={(event) => updateField('year', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Daily Price ({currency})<input required type='number' min='0' value={form.pricePerDay} onChange={(event) => updateField('pricePerDay', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Category<input required value={form.category} onChange={(event) => updateField('category', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Transmission<input required value={form.transmission} onChange={(event) => updateField('transmission', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Fuel Type<input required value={form.fuel_type} onChange={(event) => updateField('fuel_type', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Seats<input required type='number' min='1' value={form.seating_capacity} onChange={(event) => updateField('seating_capacity', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label>Location<input required value={form.location} onChange={(event) => updateField('location', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
          <label className='sm:col-span-2'>Description<textarea required rows={3} value={form.description} onChange={(event) => updateField('description', event.target.value)} className='mt-1 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white' /></label>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button type='button' onClick={onClose} className='rounded border px-4 py-2 text-gray-600 dark:text-gray-300'>Cancel</button>
          <button type='submit' disabled={isLoading} className='rounded bg-primary px-4 py-2 text-white disabled:opacity-50'>{isLoading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}

export default EditCar
