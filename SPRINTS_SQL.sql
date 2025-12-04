-- SQL for creating Sprints tables in PHPMyAdmin (MySQL)

-- Table: sprints
CREATE TABLE IF NOT EXISTS `sprints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `observation` text,
  `status` enum('planned','in_progress','completed') NOT NULL DEFAULT 'planned',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_sprints_project_id` (`project_id`),
  CONSTRAINT `fk_sprints_projects` FOREIGN KEY (`project_id`) REFERENCES `projetos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: sprint_tasks
CREATE TABLE IF NOT EXISTS `sprint_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sprint_id` int(11) NOT NULL,
  `description` varchar(500) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sprint_tasks_sprint_id` (`sprint_id`),
  CONSTRAINT `fk_sprint_tasks_sprints` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
