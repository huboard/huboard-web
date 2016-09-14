module Api
  class ProjectsController < ApiController
     
    def index
      path_prefix = "./repos/#{params[:user]}/#{params[:repo]}/projects" 
      projects =  Project.new(gh.connection, path_prefix).all do |request|
        request.headers["Accept"] = "application/vnd.github.inertia-preview.full+json"
      end
      render json: projects
    end

    def show
      path_prefix = "./repos/#{params[:user]}/#{params[:repo]}/projects/#{params[:id]}" 
      project =  Project.new(gh.connection, path_prefix).all do |request|
        request.headers["Accept"] = "application/vnd.github.inertia-preview.full+json"
      end

      path_prefix = "./repos/#{params[:user]}/#{params[:repo]}/projects/#{params[:id]}/columns" 
      columns =  Project.new(gh.connection, path_prefix).all do |request|
        request.headers["Accept"] = "application/vnd.github.inertia-preview.full+json"
      end

      render json: { project: project, columns: columns }
    end

    class Project < Ghee::ResourceProxy
      accept_header "application/vnd.github.inertia-preview.full+json"
    end

  end
end

