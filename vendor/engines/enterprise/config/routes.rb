Rails.application.routes.draw do 
  match 'unauthenticated_enterprise' => 'enterprise/errors#unauthenticated_enterprise', via: :all
  mount Enterprise::Engine => "/enterprise"
end
Enterprise::Engine.routes.draw do
end
