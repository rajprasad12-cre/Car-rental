import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppContext } from '../context/AppContext'
import { cityList } from '../assets/assets'

// Readymade FAQ knowledge base for the assistant.
// Answers are generated from live app data (cars/currency) where possible,
// so this stays accurate without needing manual updates.
const buildFaqItems = (ctx) => {
    const cars = ctx.cars || []
    const currency = ctx.currency || '₹'
    const availableCars = cars.filter((c) => c.isAvaliable ?? c.isAvailable ?? true)
    const prices = cars.map((c) => c.pricePerDay).filter((p) => typeof p === 'number')
    const categories = [...new Set(cars.map((c) => c.category).filter(Boolean))]
    const fuelTypes = [...new Set(cars.map((c) => c.fuel_type).filter(Boolean))]

    return [
        {
            id: 'availability',
            label: 'Car availability',
            keywords: ['available', 'availability', 'free car', 'book now', 'in stock'],
            answer: cars.length
                ? `Right now ${availableCars.length} out of ${cars.length} cars are available for booking. Availability depends on your pickup date, return date and location, so use the search bar on the homepage or the Cars page to check what's free for your exact dates!`
                : `We keep our fleet updated in real time. Head over to the "Cars" page and pick your dates and location to see exactly which cars are available!`,
        },
        {
            id: 'pricing',
            label: 'Pricing & rates',
            keywords: ['price', 'pricing', 'cost', 'rate', 'charge', 'fee', 'how much'],
            answer: prices.length
                ? `Our cars are priced from ${currency}${Math.min(...prices)} to ${currency}${Math.max(...prices)} per day depending on the brand, model and category. Open any car's details page to see its exact daily rate!`
                : `Prices vary by car category — from budget-friendly sedans to premium SUVs. Check the Cars page for exact per-day pricing.`,
        },
        {
            id: 'locations',
            label: 'Locations we serve',
            keywords: ['location', 'city', 'where', 'area', 'pickup point'],
            answer: `We currently offer car rentals in ${(cityList || []).join(', ')}. Select your preferred pickup location from the homepage search bar to see cars available near you!`,
        },
        {
            id: 'booking',
            label: 'How to book a car',
            keywords: ['book', 'booking', 'reserve', 'rent a car', 'how to book'],
            answer: `Booking is simple: 1) Search by location & dates on the homepage 2) Browse and open a car you like 3) Click "Book Now" and confirm your dates 4) Pay securely online 5) Track your booking anytime from "My Bookings".`,
        },
        {
            id: 'contact',
            label: 'Contact support',
            keywords: ['contact', 'support', 'help', 'phone', 'email', 'reach you'],
            answer: `You can reach our support team at rajprasad86965@gmail.com or +91 7364822680. We're based in Siliguri, West Bengal and happy to help with any booking issues!`,
        },
        {
            id: 'documents',
            label: 'Documents required',
            keywords: ['document', 'license', 'id proof', 'papers', 'licence'],
            answer: `You'll need a valid driving license, a government-issued photo ID, and a valid payment method to complete your booking. Some premium cars may require additional ID verification at pickup.`,
        },
        {
            id: 'payment',
            label: 'Payment methods',
            keywords: ['payment', 'pay', 'upi', 'card', 'netbanking', 'razorpay'],
            answer: `We accept all major credit/debit cards, UPI, netbanking and wallets through our secure Razorpay checkout — your payment details are never stored on our servers.`,
        },
        {
            id: 'cancellation',
            label: 'Cancellation policy',
            keywords: ['cancel', 'cancellation', 'refund', 'reschedule'],
            answer: `You can cancel or modify a booking from "My Bookings" before the pickup date. For refund timelines on a specific booking, please contact our support team so they can assist you directly.`,
        },
        {
            id: 'categories',
            label: 'Car categories available',
            keywords: ['category', 'categories', 'suv', 'sedan', 'type of car'],
            answer: categories.length
                ? `We currently list these categories: ${categories.join(', ')}. Use the filters on the Cars page to browse by category, fuel type or transmission.`
                : `We offer a variety of categories including SUVs and Sedans. Use the filters on the Cars page to browse by category.`,
        },
        {
            id: 'listcar',
            label: 'List your own car',
            keywords: ['list my car', 'become owner', 'rent out my car', 'add car', 'owner'],
            answer: `Want to earn from your car? Click "List cars" in the navbar to become an owner, then use your Owner Dashboard to add your car with photos, pricing and availability.`,
        },
        {
            id: 'mybookings',
            label: 'My bookings status',
            keywords: ['my booking', 'booking status', 'pending', 'confirmed booking'],
            answer: `Open "My Bookings" from the navbar to see every booking you've made along with its status — pending, confirmed or completed.`,
        },
        {
            id: 'fuel',
            label: 'Fuel & transmission options',
            keywords: ['fuel', 'petrol', 'diesel', 'electric', 'transmission', 'automatic', 'manual', 'mileage'],
            answer: fuelTypes.length
                ? `Our fleet includes ${fuelTypes.join(', ')} options, with both automatic and manual transmissions. Check each car's details page for its exact fuel type and transmission.`
                : `Our fleet includes petrol, diesel and hybrid options, with both automatic and manual transmissions. Check each car's details page for exact specs.`,
        },
    ]
}

const PRIMARY_IDS = ['availability', 'pricing', 'locations', 'booking', 'contact']

const Chatbot = () => {
    const ctx = useAppContext() || {}
    const [isOpen, setIsOpen] = useState(false)
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [currentOptions, setCurrentOptions] = useState('primary')
    const scrollRef = useRef(null)
    const idRef = useRef(0)
    const timeoutRef = useRef(null)

    const faqItems = buildFaqItems(ctx)
    const primaryItems = faqItems.filter((f) => PRIMARY_IDS.includes(f.id))
    const otherItems = faqItems.filter((f) => !PRIMARY_IDS.includes(f.id))

    const nextId = () => {
        idRef.current += 1
        return idRef.current
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const openChat = () => {
        setIsOpen(true)
        if (!hasOpenedOnce) {
            setHasOpenedOnce(true)
            setMessages([
                {
                    id: nextId(),
                    sender: 'bot',
                    text: "👋 Hi there! I'm your CarRental Assistant. Ask me about car availability, pricing, locations or booking — or pick a question below!",
                },
            ])
            setCurrentOptions('primary')
        }
    }

    const pushBotReply = (text) => {
        setIsTyping(true)
        timeoutRef.current = setTimeout(() => {
            setIsTyping(false)
            setMessages((prev) => [...prev, { id: nextId(), sender: 'bot', text }])
        }, 550 + Math.min(text.length * 6, 700))
    }

    const handleSelectFaq = (item) => {
        setMessages((prev) => [...prev, { id: nextId(), sender: 'user', text: item.label }])
        setCurrentOptions('primary')
        pushBotReply(item.answer)
    }

    const handleShowOthers = () => {
        setMessages((prev) => [...prev, { id: nextId(), sender: 'user', text: 'Others' }])
        setCurrentOptions('others')
        pushBotReply('Sure! Here are more things I can help with:')
    }

    const handleBackToMain = () => {
        setCurrentOptions('primary')
    }

    const findMatch = (text) => {
        const lower = text.toLowerCase()
        return faqItems.find((item) => item.keywords.some((k) => lower.includes(k)))
    }

    const handleSend = (e) => {
        e.preventDefault()
        const text = inputValue.trim()
        if (!text) return
        setMessages((prev) => [...prev, { id: nextId(), sender: 'user', text }])
        setInputValue('')
        const match = findMatch(text)
        setCurrentOptions('primary')
        if (match) {
            pushBotReply(match.answer)
        } else {
            pushBotReply("I'm not totally sure about that one 🤔 I can help with car availability, pricing, locations, bookings and support.")
        }
    }

    return (
        <>
            {/* Floating launcher icon */}
            <motion.button
                type="button"
                aria-label="Open chat assistant"
                onClick={() => (isOpen ? setIsOpen(false) : openChat())}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-[0px_8px_24px_rgba(37,99,235,0.45)] cursor-pointer"
            >
                {!hasOpenedOnce && (
                    <span className="absolute inset-0 rounded-full bg-primary opacity-60 animate-ping" />
                )}
                {!isOpen && !hasOpenedOnce && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" />
                )}
                <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="chat"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.163 0-2.27-.187-3.28-.53L3 21l1.607-3.813C3.586 15.925 3 14.02 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </motion.svg>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] max-w-sm h-[75vh] max-h-[560px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-borderColor dark:border-gray-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.163 0-2.27-.187-3.28-.53L3 21l1.607-3.813C3.586 15.925 3 14.02 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-tight">CarRental Assistant</p>
                                    <p className="text-[11px] text-white/80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Close chat"
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-light dark:bg-gray-900/40">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                                            msg.sender === 'user'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-borderColor dark:border-gray-600 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-700 border border-borderColor dark:border-gray-600">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick reply chips */}
                        {!isTyping && (
                            <div className="flex flex-wrap gap-2 px-3 py-2.5 border-t border-borderColor dark:border-gray-700 bg-white dark:bg-gray-800">
                                {currentOptions === 'primary' &&
                                    primaryItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectFaq(item)}
                                            className="text-xs px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                {currentOptions === 'primary' && (
                                    <button
                                        onClick={handleShowOthers}
                                        className="text-xs px-3 py-1.5 rounded-full border border-borderColor dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                    >
                                        Others
                                    </button>
                                )}
                                {currentOptions === 'others' && (
                                    <>
                                        {otherItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelectFaq(item)}
                                                className="text-xs px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleBackToMain}
                                            className="text-xs px-3 py-1.5 rounded-full border border-borderColor dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                        >
                                            ⬅ Back
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-borderColor dark:border-gray-700 bg-white dark:bg-gray-800">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 px-4 py-2 rounded-full text-sm border border-borderColor dark:border-gray-600 bg-light dark:bg-gray-700 text-gray-700 dark:text-gray-100 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                aria-label="Send message"
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary hover:bg-primary-dull text-white shrink-0 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Chatbot
