require "serialport"
require "websocket-eventmachine-client"
require "json"

serial = SerialPort.open("/dev/cu.usbmodem1431")

EM.run do
  ws = WebSocket::EventMachine::Client.connect(:uri => "ws://0.0.0.0:1666")
  ws.onopen do
    puts "Connected"
  end

  EM.defer do
    while data = serial.gets(";")
      raw = data.chomp.strip
      values = raw.split(",").map { |value| value.to_i >= 800 }

      if values.size == 4
        ws.send values.to_json
      end
    end
  end
end
