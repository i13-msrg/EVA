function [schedule] = evadmm(inputs)
%ADMM Simple implementation of the ADMM Algorithm as function
%   Detailed explanation goes here

%% Parameters
reqs = double(inputs);
deltaT = 15 * 60;         % Time slot duration [sec]    % 15min. per solot
T = 24 * 3600 / deltaT;   % Number of time slots        % 96 timeslots
N = size(reqs, 2);

%% Aggregator data & Global Constraints
agr_params = load('agr_params');  % D := Base demand profile
fprintf('\n\nGenerating EV fleet global cost and constraints..')
x = sdpvar(T, N, 'full');
cost_i = norm(agr_params.D + x * ones(N, 1));

%% EV Constraints
fprintf('\n\nGenerating local EV constraints..')
Constraints = zeros(N * 2);
for i=1:N     
    Constraints = [Constraints, reqs(2:end, i)' * x(:, i) == reqs(1, i)];
    Constraints = [Constraints, 0 <= x(:, i) <= reqs(2:end, i) * 4];    
end

%% Solution YALMIP
ops = sdpsettings('debug', 1);
ops = sdpsettings(ops, 'solver', 'fmincon');
    ops = sdpsettings(ops, 'fmincon.UseParallel', true);
    ops = sdpsettings(ops, 'fmincon.MaxIter', 100000);
    ops = sdpsettings(ops, 'fmincon.MaxFunEvals', 100001);

sol = solvesdp(Constraints, cost_i, ops);


if sol.problem == 0
    schedule = double(x);
    cost = double(cost_i); 

else
    fprintf('ADMM: Hmm, something went wrong!');
    sol.info
    yalmiperror(sol.problem)
end

end

