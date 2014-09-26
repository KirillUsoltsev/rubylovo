require "em-websocket"

EM.run do
  @channel = EM::Channel.new

  EM::WebSocket.run(:host => "0.0.0.0", :port => 1666) do |ws|
    ws.onopen do
      sid = @channel.subscribe { |msg| ws.send msg }
      puts "#{sid} Connected"

      ws.onclose do
        @channel.unsubscribe(sid)
        puts "Connection closed"
      end

      ws.onmessage do |msg|
        @channel.push msg
        puts "Recieved message: #{msg}"
      end
    end
  end
end
