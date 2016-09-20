Rails.application.routes.draw do
  constraints subdomain: 'www' do
      get ':any', to: redirect(subdomain: nil, path: '/%{any}'), any: /.*/
  end

  if ENV["SIDEKIQ"]
    require 'sidekiq/web'
    require 'authorized_team_constraint'
    mount Sidekiq::Web => '/site/sidekiq', :constraints => AuthorizedTeamConstraint.new
  end

  root to: 'dashboard#index', constraints: LoggedInConstraint.new 
  get '/dashboard' => 'dashboard#index', constraints: LoggedInConstraint.new 
  get '/dashboard', to: redirect('/')
  root to: 'marketing#index', as: 'marketing_root'

  get '/site/terms' => 'site#terms'
  get '/site/privacy' => 'site#privacy'
  post '/site/webhook/issues' => 'api/webhooks#publish_issue_event', as: 'issues_webhook'
  post '/site/webhook/issue_comment' => 'api/webhooks#log_comment', as: 'issue_comment_webhook'
  post '/site/webhook/pull_request' => 'api/webhooks#publish_pull_request_event', as: 'pull_request_webhook'

  # errors
  match '/404', to: 'errors#not_found', constraints: { status: /\d{3}/ }, via: :all
  match '/422', to: 'errors#unprocessable_entity', constraints: { status: /\d{3}/ }, via: :all
  match '/500', to: 'errors#server_error', constraints: { status: /\d{3}/ }, via: :all
  match '/503', to: 'errors#server_error', constraints: { status: /\d{3}/ }, via: :all
  match '/400', to: 'errors#server_error', constraints: { status: /\d{3}/ }, via: :all
  match '/403', to: 'errors#server_error', constraints: { status: /\d{3}/ }, via: :all
  match 'unauthenticated', to: 'errors#unauthenticated', via: :all

  get 'welcome' => 'welcome#index', as: :welcome
  get 'integrations' => 'marketing#integrations'
  get 'pricing' => 'marketing#pricing'
  get 'login', to: redirect('/login/github')
  get 'logout' => 'login#logout'
  get 'login/public' => 'login#public'
  get 'login/private' => 'login#private'
  get 'login/github' => 'login#github'
  get 'oauth/github/callback' => 'login#github_callback'


  get '/repositories/private/:user' => 'dashboard#private', as: 'repositories_private'

  get '/repositories/public/:user' => 'dashboard#public', as: 'repositories_public'


  namespace :api do
    get  'uploads/asset' => 'uploads#asset_uploader', as: "legacy_uploader"
    #Webhooks
    post '/site/webhook/issue' => 'webhooks#legacy'
    post '/site/webhook/comment' => 'webhooks#legacy'
    post '/site/stripe/webhook' => 'webhooks#stripe'

    scope '/v2/:user/:repo' do
      constraints(:user => /[^\/]+/, :repo => /[^\/]+/) do
        get '/' => 'repos#show'
        get 'details' => 'repos#details' 
      end
    end

    scope '/:user/:repo' do
      constraints(:user => /[^\/]+/, :repo => /[^\/]+/) do
        post  'uploads/signature' => 'uploads#asset_uploader'
        post 'uploads/asset' => 'uploads#local_uploader'

        get 'hooks' => 'webhooks#hooks'
        get 'subscriptions' => 'subscriptions#show'
        resources :integrations, only: [:index, :create, :destroy]
        resources :milestones, only: [:create, :update]
        resources :links, only: [:index, :create]
        delete 'links' => 'links#destroy'
        post 'links/validate' => 'links#validate'
        put 'links/update' => 'links#update'
        put 'columns' => 'columns#update'
        get 'settings' => 'settings#index'
        get 'health/board' => 'health#board'
        post 'health/board' => 'health#treat_board'
        get 'commits' => 'board#commits', as: 'commits'
        get 'commit/:commit' => 'board#commit', as: 'commit'
        get 'issue_template' => 'board#issue_template'

        #Issues
        get 'issues/:number' => 'issues#issue'
        get 'issues' => 'issues#issues'
        get 'issues/:number/details' => 'issues#details'
        get 'issues/:number/status' => 'issues#status'
        post 'issues' => 'issues#open_issue'
        post 'issues/:number/comment' => 'issues#create_comment'
        put 'issues/comments/:id' => 'issues#update_comment'
        put 'issues/:number' => 'issues#update_issue'
        put 'issues/:number/label' => 'issues#label_issue'
        put 'issues/:number/unlabel' => 'issues#unlabel_issue'
        post 'issues/:number/close' => 'issues#close_issue'
        post 'issues/:number/open' => 'issues#reopen_issue'
        put 'issues/:number/blocked' => 'issues#block'
        delete 'issues/:number/blocked' => 'issues#unblock'
        put 'issues/:number/ready' => 'issues#ready'
        delete 'issues/:number/ready' => 'issues#unready'
        post 'issues/:number/dragcard' => 'issues#drag_card'
        put 'issues/:number/archived' => 'issues#archive_issue'
        post 'issues/:number/assigncard' => 'issues#assign_issue'
        post 'issues/:number/unassigncard' => 'issues#unassign_issue'
        post 'issues/:number/assignmilestone' => 'issues#assign_milestone'

        post 'milestones/:number/reorder' => 'milestones#reorder'
      end
    end

      
  end


  constraints(:user => /[^\/]+/) do
    get '/:user'       => 'dashboard#user', as: 'user'
  end

  constraints(:user => /[^\/]+/, :repo => /[^\/]+/) do
    get '/:user/:repo/board/create' => 'board#create_board'
    post '/:user/:repo/board/create' => 'board#create'

    get '/:user/:repo/board/enable_issues' => 'board#enable_issues?'
    post '/:user/:repo/board/enable_issues' => 'board#enable_issues'

    get '/:user/:repo' => 'board#index', as: 'board'
  end


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
