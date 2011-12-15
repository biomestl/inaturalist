class ProjectUser < ActiveRecord::Base
  
  belongs_to :project
  belongs_to :user
  has_many :project_observations, :through => :project, :include => [:observation], 
    :conditions => 'observations.user_id = #{user_id}'
  
  before_destroy :prevent_owner_from_leaving
  validates_uniqueness_of :user_id, :scope => :project_id, :message => "already a member of this project"
  validates_rules_from :project, :rule_methods => [:has_time_zone?]
  
  named_scope :curators, :conditions => {:role => "curator"}
  
  def prevent_owner_from_leaving
    raise "The owner of a project can't leave the project" if project.user_id == user_id
  end
  
  def has_time_zone?
    user.time_zone?
  end
  
  def is_curator?
    role == 'curator'
  end
  
  def update_observations_counter_cache
    update_attributes(:observations_count => project_observations.count)
  end
  
  def update_taxa_counter_cache
    user_taxon_ids = ProjectObservation.all(
      :select => "distinct observations.taxon_id",
      :include => [{:observation => :taxon}, :curator_identification],
      :conditions => [
        "identifications.id IS NULL AND project_id = ? AND observations.user_id = ? AND taxa.rank_level <= ?",
        project_id, user_id, Taxon::RANK_LEVELS['species']
      ]
    ).map{|po| po.observation.taxon_id}
    
    curator_taxon_ids = ProjectObservation.all(
      :select => "distinct identifications.taxon_id",
      :include => [:observation, {:curator_identification => :taxon}],
      :conditions => [
        "identifications.id IS NOT NULL AND project_id = ? AND observations.user_id = ? AND taxa.rank_level <= ?",
        project_id, user_id, Taxon::RANK_LEVELS['species']
      ]
    ).map{|po| po.curator_identification.taxon_id}
    
    update_attributes(:taxa_count => (user_taxon_ids + curator_taxon_ids).uniq.size)
  end
  
  def self.update_observations_counter_cache_from_project_and_user(project_id, user_id)
    return unless project_user = ProjectUser.first(:conditions => {
      :project_id => project_id, 
      :user_id => user_id
    })
    project_user.update_observations_counter_cache
  end
  
  def self.update_taxa_counter_cache_from_project_and_user(project_id, user_id)
    return unless project_user = ProjectUser.first(:conditions => {
      :project_id => project_id, 
      :user_id => user_id
    })
    project_user.update_taxa_counter_cache
  end
  
  def self.update_taxa_obs_and_species_count_after_update_observation(observation_id, user_id)
    unless obs = Observation.find_by_id(observation_id)
      return
    end
    unless usr = User.find_by_id(user_id)
      return
    end
    obs.project_observations.each do |po|
      if project_user = ProjectUser.first(:conditions => {
        :project_id => po.project_id, 
        :user_id => user_id
      })
        project_user.update_taxa_counter_cache
        project_user.update_observations_counter_cache
        Project.update_species_count(po.project_id)
      end
    end
  end
end
