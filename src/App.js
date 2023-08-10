import './App.css'
import {useState, useEffect} from 'react'

function App() {
  const [activityType, setActivityType] = useState('medicine')
  const [activityName, setActivityName] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [isDaily, setIsDaily] = useState(false)
  const [reminders, setReminders] = useState([])
  const [audioContext, setAudioContext] = useState(null)
  const [oscillator, setOscillator] = useState(null)

  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders')
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }

    const savedContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    setAudioContext(savedContext)
    const savedOscillator = savedContext.createOscillator()
    savedOscillator.type = 'sawtooth'
    savedOscillator.connect(savedContext.destination)
    setOscillator(savedOscillator)

    return () => {
      savedOscillator.disconnect()
      savedContext.close()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders))
  }, [reminders])

  const startAlarm = () => {
    if (oscillator) {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
      oscillator.start()
      oscillator.loop = true
    }
  }

  const stopAlarm = () => {
    if (oscillator) {
      oscillator.stop()
    }
  }

  const scheduleNotification = (time, reminderName, alertMessage) => {
    const now = new Date()
    const [hours, minutes] = time.split(':')
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
    )

    const timeDifference = notificationTime - now

    setTimeout(() => {
      startAlarm()
      alert(alertMessage)
    }, timeDifference)
  }

  const scheduleDailyNotification = (time, reminderName, alertMessage) => {
    const [hours, minutes] = time.split(':')
    const notificationTime = new Date()
    notificationTime.setHours(hours)
    notificationTime.setMinutes(minutes)

    if (notificationTime <= new Date()) {
      notificationTime.setDate(notificationTime.getDate() + 1)
    }
    const timeDifference = notificationTime - new Date()
    setInterval(() => {
      startAlarm()
      alert(alertMessage)
    }, timeDifference)
  }

  const setReminder = () => {
    if (!activityName || !activityTime) {
      alert('Please fill in all fields.')
      return
    }

    const reminder = (
      <div className="reminder">
        <p>
          <strong>{activityName}</strong> at {activityTime}
          {isDaily ? ' (Daily)' : ''}
        </p>
      </div>
    )

    setReminders([...reminders, reminder])

    if (isDaily) {
      scheduleDailyNotification(
        activityTime,
        activityName,
        `Time for ${activityType}!`,
      )
    } else {
      scheduleNotification(
        activityTime,
        activityName,
        `Time for ${activityType}!`,
      )
    }
  }

  return (
    <div className="app-container">
      <h1 className="title">Daily Health Reminders</h1>
      <p className="current-date">Current Date: {new Date().toDateString()}</p>
      <div>
        <label htmlFor="activityType">Select Activity:</label>
        <select
          id="activityType"
          className="select-dropdown"
          value={activityType}
          onChange={e => setActivityType(e.target.value)}
        >
          <option value="medicine">Medicine</option>
          <option value="food">Food</option>
          <option value="yoga">Yoga</option>
          <option value="walk">Walking</option>
        </select>
      </div>
      <div>
        <label htmlFor="activityName">Activity Name:</label>
        <input
          type="text"
          id="activityName"
          className="input-field"
          value={activityName}
          onChange={e => setActivityName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="activityTime">Activity Time:</label>
        <input
          type="time"
          id="activityTime"
          className="input-field"
          value={activityTime}
          onChange={e => setActivityTime(e.target.value)}
        />
        <label className="checkbox-label" htmlFor="daily">
          Daily
        </label>
        <input
          type="checkbox"
          id="daily"
          className="checkbox-label"
          checked={isDaily}
          onChange={e => setIsDaily(e.target.checked)}
        />
      </div>
      <button className="button" onClick={setReminder}>
        Set Reminder
      </button>
      <button className="button" onClick={stopAlarm}>
        Stop Alarm
      </button>
      <div className="reminders-container" id="reminders">
        {reminders}
      </div>
    </div>
  )
}

export default App
