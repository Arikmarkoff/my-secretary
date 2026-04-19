import { useState } from 'react'

import { MainButtonContext, BackButtonContext } from './hooks/useTelegram'
import Welcome from './screens/Welcome'
import ServiceSelect from './screens/ServiceSelect'
import ProblemDescription from './screens/ProblemDescription'
import DateSelect from './screens/DateSelect'
import TimeSelect from './screens/TimeSelect'
import ContactInfo from './screens/ContactInfo'
import Confirmation from './screens/Confirmation'
import Success from './screens/Success'
import MyBookings from './screens/MyBookings'
import BookingDetail from './screens/BookingDetail'

const initialData = {
  service: null,
  problem: '',
  date: null,
  time: null,
  name: '',
  phone: '',
  bookingId: null,
  selectedBooking: null,
}

export default function App() {
  const [screen, setScreen] = useState('WELCOME')
  const [data, setData] = useState(initialData)
  const [mainBtn, setMainBtn] = useState(null)   // { text, handler, enabled }
  const [backFn, setBackFn] = useState(null)


  const update = (fields) => setData(prev => ({ ...prev, ...fields }))

  const go = (screenName, fields = {}) => {
    if (Object.keys(fields).length > 0) update(fields)
    setScreen(screenName)
  }

  const startNewBooking = () => {
    setData(initialData)
    setScreen('SERVICE')
  }

  const props = { data, update, go, startNewBooking }

  const screens = {
    WELCOME: <Welcome {...props} />,
    SERVICE: <ServiceSelect {...props} />,
    PROBLEM: <ProblemDescription {...props} />,
    DATE: <DateSelect {...props} />,
    TIME: <TimeSelect {...props} />,
    CONTACT: <ContactInfo {...props} />,
    CONFIRM: <Confirmation {...props} />,
    SUCCESS: <Success {...props} />,
    MY_BOOKINGS: <MyBookings {...props} />,
    BOOKING_DETAIL: <BookingDetail {...props} />,
  }

  const mainBtnCtx = { setButton: setMainBtn }
  const backBtnCtx = { setBack: (fn) => setBackFn(fn ? () => fn : null) }

  return (
    <MainButtonContext.Provider value={mainBtnCtx}>
      <BackButtonContext.Provider value={backBtnCtx}>
        <div className="app">
          {backFn && (
            <button className="back-btn" onClick={backFn}>
              ← Назад
            </button>
          )}

          {screens[screen]}

          {mainBtn && (
            <div className="main-btn-wrap">
              <button
                className={`main-btn${mainBtn.enabled ? '' : ' disabled'}`}
                onClick={() => mainBtn.enabled && mainBtn.handler()}
              >
                {mainBtn.text}
              </button>
            </div>
          )}
        </div>
      </BackButtonContext.Provider>
    </MainButtonContext.Provider>
  )
}
