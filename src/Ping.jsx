import { useEffect, useRef, useState } from "react";

const Ping = ({ socket, isConnected, eventData, nbEventData }) => {
  const [latencyCheckStart, setLatencyCheckStart] = useState(0);
  const latencyRef = useRef(latencyCheckStart);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        ping();
        // todo : detect when pong is not sent back = disconnected, otherwise it just doesnt show
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected, socket]);

  const ping = () => {
    latencyRef.current = Date.now();
    socket.send("/ping ");
  };

  useEffect(() => {
    if (eventData.startsWith("/pong")) {
      setLatency(Date.now() - latencyRef.current);
    }
  }, [eventData, nbEventData]);

  return (
    <div className="ping">
      <a href="www.linkedin.com/in/sylvainsenechal" target="_blank">
        {" "}
        By Sylvain Senechal ➡️{" "}
      </a>
      <div>latency {latency}</div>
    </div>
  );
};

export default Ping;
