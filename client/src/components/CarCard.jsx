import React, { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../context/AppContext'

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [openChat, setOpenChat] = useState(false);

  return (<>
    <div
      onClick={() => {
        navigate(`/car-details/${car._id}`);
        scrollTo(0, 0);
      }}
      className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1
    transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image}
          alt="car image"
          className="w-full h-full
            object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {car.isAvaliable && (
          <p
            className="absolute top-4 left-4 bg-primary/90
            text-white text-xs px-2.5 py-1 rounded-full"
          >
            Available Now
          </p>
        )}

        <div
          className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm
            text-white px-3 py-2 rounded-lg"
        >
          <span className="font-semibold">
            {currency}
            {car.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand} {car.model}
            </h3>
            <p className="text-muted-foreground text-sm">
              {car.category} {car.year}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.users_icon} alt="" className="h-4 mr-3" />
            <span>{car.seating_capacity} seats</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.fuel_icon} alt="" className="h-4 mr-3" />
            <span>{car.fuel_type} </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.car_icon} alt="" className="h-4 mr-3" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.location_icon} alt="" className="h-4 mr-3" />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
      {/* Ai chat button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenChat(true);
        }}
        className=" absolute bottom-4 left-4 bg-primary text-white text-sm px-4 py-2 rounded-full shadow-lg
          opacity-0 scale-90 group-hover:opacity-100 hover:scale-100 transition-all duration-300 cursor-pointer
          pointer-events-auto"
      >
        Ask AI
      </button>
    </div>
      {
        openChat && <ChatModal car={car} onClose={() => setOpenChat(false)} />
       }
    </>
  );
};

//function for chat window open or close

function ChatModal({ car, onClose }) {
  const [input, setInput] = useState("");
  const {axios} =useAppContext()
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! Ask me anything about the ${car.brand} ${car.model}.`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/ai/chat", {
        carId: car._id,
        carData: car,
        message: input,
        history: newMessages,
      });
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "AI is not available right now." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} >
      <div onClick={(e)=>e.stopPropagation()} className="relative bg-white rounded-xl w-[92%] max-w-xl h-[70vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h4 className="font-semibold">AI Assistant</h4>
            <p className="text-xs text-gray-500">
              {car.brand} {car.model}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] ${
                m.role === "user" ? "ml-auto text-right" : ""
              }`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-xl ${
                  m.role === "user" ? "bg-primary/10" : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Ask about seats, features..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarCard;
