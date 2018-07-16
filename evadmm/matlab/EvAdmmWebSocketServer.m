classdef EvAdmmWebSocketServer < WebSocketServer
    %ADMMWEBSOCKETSERVER Summary of this class goes here
    %   Detailed explanation goes here
    
    properties
    end
    
    methods
        function obj = EvAdmmWebSocketServer(varargin)
            %Constructor
            obj@WebSocketServer(varargin{:});
        end
    end
    
    methods (Access = protected)
        function onOpen(obj,conn,message)
            fprintf('%s\n',message)
        end
        
        function onTextMessage(obj,conn,message)
            % This function sends an echo back to the client
            fprintf('Oops, Text Message received: %s\n',message)
        end
        
        function onBinaryMessage(obj,conn,bytearray)
            fprintf('Binary Message received:\n%s\n',int8(bytearray));

            % Convert from byte array to uint array 
            % and reshape from single column array to 97 x N matrix
            dto_in = reshape(typecast(bytearray, 'uint32'), 97, []);
            assignin('base', 'input', dto_in);
            
            % Compute schedule using adapted EV ADMM implementation
            schedule = evadmm(dto_in);

            % Reshape 97 x N matrix to single column array
            dto_out = schedule(:);

            % Reduce precision from double to float and convert to byte array
            dto_out_buf = typecast(single(dto_out), 'int8');

            % Send response back to the client via WebSocket
            conn.send(dto_out_buf);
        end
        
        function onError(obj,conn,message)
            fprintf('%s\n',message)
        end
        
        function onClose(obj,conn,message)
            fprintf('%s\n',message)
        end
    end
end

