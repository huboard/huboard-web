Rails.application.routes.draw do 
  get 'login' => "login#index", as: "enterprise_login"
  match 'unauthenticated_enterprise' => 'enterprise/errors#unauthenticated_enterprise', via: :all
  get '/settings/profile', to: redirect('/')
  mount Enterprise::Engine => "/_enterprise"
end
Enterprise::Engine.routes.draw do
end
