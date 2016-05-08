Warden::Manager.after_authentication do |user, auth, opts|
  scope = opts.fetch(:scope)
  strategy = auth.winning_strategies[scope]

  strategy.finalize_flow!  if strategy.class == Warden::GitHub::Strategy
end
