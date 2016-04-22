module Api
  class ApiController < ApplicationController
    skip_before_action :check_account
  end
end
