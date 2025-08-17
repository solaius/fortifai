import React, { useState, useEffect } from 'react';
import {
  ExpandableSection,
  TextInput,
  Checkbox,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  FormGroup,
  DatePicker,
  TimePicker,
  Divider,
  Title,
  Badge
} from '@patternfly/react-core';
import CustomSelect from '../Common/CustomSelect';
import {
  SearchIcon,
  FilterIcon,
  TimesIcon,
  CalendarIcon,
  TagIcon,
  DatabaseIcon,
  UserIcon,
  KeyIcon
} from '@patternfly/react-icons';
import { SecretReferenceFilter } from '../../types/secrets';

interface SecretFiltersProps {
  filter: SecretReferenceFilter;
  onFilterChange: (filter: SecretReferenceFilter) => void;
  onClearFilters: () => void;
  providers: Array<{ id: string; name: string; type: string }>;
  namespaces: string[];
  projects: string[];
  teams: string[];
  categories: string[];
}

const SecretFilters: React.FC<SecretFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  providers,
  namespaces,
  projects,
  teams,
  categories
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilter, setLocalFilter] = useState<SecretReferenceFilter>(filter);
  const [searchQuery, setSearchQuery] = useState(filter.name || '');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(filter.providerId ? [filter.providerId] : []);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(filter.namespace ? [filter.namespace] : []);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(filter.project ? [filter.project] : []);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(filter.team ? [filter.team] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.category ? [filter.category] : []);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>(filter.classification ? [filter.classification] : []);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(filter.environment ? [filter.environment] : []);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(filter.priority ? [filter.priority] : []);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);

  // Date picker states
  const [createdAfterDate, setCreatedAfterDate] = useState<string>('');
  const [createdBeforeDate, setCreatedBeforeDate] = useState<string>('');
  const [updatedAfterDate, setUpdatedAfterDate] = useState<string>('');
  const [updatedBeforeDate, setUpdatedBeforeDate] = useState<string>('');
  const [lastRotatedAfterDate, setLastRotatedAfterDate] = useState<string>('');
  const [lastRotatedBeforeDate, setLastRotatedBeforeDate] = useState<string>('');

  useEffect(() => {
    setLocalFilter(filter);
    setSearchQuery(filter.name || '');
    setSelectedProviders(filter.providerId ? [filter.providerId] : []);
    setSelectedNamespaces(filter.namespace ? [filter.namespace] : []);
    setSelectedProjects(filter.project ? [filter.project] : []);
    setSelectedTeams(filter.team ? [filter.team] : []);
    setSelectedCategories(filter.category ? [filter.category] : []);
    setSelectedClassifications(filter.classification ? [filter.classification] : []);
    setSelectedEnvironments(filter.environment ? [filter.environment] : []);
    setSelectedPriorities(filter.priority ? [filter.priority] : []);
    setSelectedTags(filter.tags || []);
  }, [filter]);

  const updateFilter = (updates: Partial<SecretReferenceFilter>) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSearchChange = (event: React.FormEvent<HTMLInputElement>, value: string) => {
    setSearchQuery(value);
    updateFilter({ name: value || undefined });
  };

  const handleProviderChange = (event: any, selection: string) => {
    const newProviders = selectedProviders.includes(selection)
      ? selectedProviders.filter(p => p !== selection)
      : [...selectedProviders, selection];
    
    setSelectedProviders(newProviders);
    updateFilter({ providerId: newProviders.length === 1 ? newProviders[0] : undefined });
  };

  const handleNamespaceChange = (event: any, selection: string) => {
    const newNamespaces = selectedNamespaces.includes(selection)
      ? selectedNamespaces.filter(n => n !== selection)
      : [...selectedNamespaces, selection];
    
    setSelectedNamespaces(newNamespaces);
    updateFilter({ namespace: newNamespaces.length === 1 ? newNamespaces[0] : undefined });
  };

  const handleProjectChange = (event: any, selection: string) => {
    const newProjects = selectedProjects.includes(selection)
      ? selectedProjects.filter(p => p !== selection)
      : [...selectedProjects, selection];
    
    setSelectedProjects(newProjects);
    updateFilter({ project: newProjects.length === 1 ? newProjects[0] : undefined });
  };

  const handleTeamChange = (event: any, selection: string) => {
    const newTeams = selectedTeams.includes(selection)
      ? selectedTeams.filter(t => t !== selection)
      : [...selectedTeams, selection];
    
    setSelectedTeams(newTeams);
    updateFilter({ team: newTeams.length === 1 ? newTeams[0] : undefined });
  };

  const handleCategoryChange = (event: any, selection: string) => {
    const newCategories = selectedCategories.includes(selection)
      ? selectedCategories.filter(c => c !== selection)
      : [...selectedCategories, selection];
    
    setSelectedCategories(newCategories);
    updateFilter({ category: newCategories.length === 1 ? newCategories[0] : undefined });
  };

  const handleClassificationChange = (event: any, selection: string) => {
    const newClassifications = selectedClassifications.includes(selection)
      ? selectedClassifications.filter(c => c !== selection)
      : [...selectedClassifications, selection];
    
    setSelectedClassifications(newClassifications);
    updateFilter({ classification: newClassifications.length === 1 ? newClassifications[0] as 'public' | 'internal' | 'confidential' | 'restricted' | 'secret' : undefined });
  };

  const handleEnvironmentChange = (event: any, selection: string) => {
    const newEnvironments = selectedEnvironments.includes(selection)
      ? selectedEnvironments.filter(e => e !== selection)
      : [...selectedEnvironments, selection];
    
    setSelectedEnvironments(newEnvironments);
    updateFilter({ environment: newEnvironments.length === 1 ? newEnvironments[0] as 'development' | 'staging' | 'production' | 'testing' : undefined });
  };

  const handlePriorityChange = (event: any, selection: string) => {
    const newPriorities = selectedPriorities.includes(selection)
      ? selectedPriorities.filter(p => p !== selection)
      : [...selectedPriorities, selection];
    
    setSelectedPriorities(newPriorities);
    updateFilter({ priority: newPriorities.length === 1 ? newPriorities[0] as 'low' | 'medium' | 'high' | 'critical' : undefined });
  };

  const handleTagChange = (event: any, selection: string) => {
    const newTags = selectedTags.includes(selection)
      ? selectedTags.filter(t => t !== selection)
      : [...selectedTags, selection];
    
    setSelectedTags(newTags);
    updateFilter({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleDateChange = (field: string, value: string) => {
    updateFilter({ [field]: value || undefined });
  };

  const clearFilters = () => {
    setLocalFilter({});
    setSearchQuery('');
    setSelectedProviders([]);
    setSelectedNamespaces([]);
    setSelectedProjects([]);
    setSelectedTeams([]);
    setSelectedCategories([]);
    setSelectedClassifications([]);
    setSelectedEnvironments([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setCreatedAfterDate('');
    setCreatedBeforeDate('');
    setUpdatedAfterDate('');
    setUpdatedBeforeDate('');
    setLastRotatedAfterDate('');
    setLastRotatedBeforeDate('');
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.name) count++;
    if (filter.providerId) count++;
    if (filter.namespace) count++;
    if (filter.project) count++;
    if (filter.team) count++;
    if (filter.category) count++;
    if (filter.classification) count++;
    if (filter.environment) count++;
    if (filter.priority) count++;
    if (filter.tags && filter.tags.length > 0) count++;
    if (filter.createdAfter) count++;
    if (filter.createdBefore) count++;
    if (filter.updatedAfter) count++;
    if (filter.updatedBefore) count++;
    if (filter.lastRotatedAfter) count++;
    if (filter.lastRotatedBefore) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="secret-filters">
      <ExpandableSection
        toggleText="Filters"
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        className="pf-v5-u-mb-md"
      >
        {activeFilterCount > 0 && (
          <div className="pf-v5-u-mb-sm">
            <Badge isRead>{activeFilterCount} active filters</Badge>
          </div>
        )}
        <div className="pf-v5-u-p-md">
          {/* Search and Basic Filters */}
          <Grid hasGutter>
            <GridItem span={6}>
              <FormGroup label="Search">
                <TextInput
                  id="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search secret names and descriptions..."
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Provider">
                <CustomSelect
                  variant="typeahead"
                  selections={selectedProviders}
                  onSelect={(event, selection) => handleProviderChange(event, selection)}
                  options={providers.map(provider => ({
                    value: provider.id,
                    label: `${provider.name} (${provider.type})`
                  }))}
                  placeholder="Select providers"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Namespace">
                <CustomSelect
                  variant="typeahead"
                  selections={selectedNamespaces}
                  onSelect={(event, selection) => handleNamespaceChange(event, selection)}
                  options={namespaces.map(namespace => ({
                    value: namespace,
                    label: namespace
                  }))}
                  placeholder="Select namespaces"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Project">
                <CustomSelect
                  variant="typeahead"
                  selections={selectedProjects}
                  onSelect={(event, selection) => handleProjectChange(event, selection)}
                  options={projects.map(project => ({
                    value: project,
                    label: project
                  }))}
                  placeholder="Select projects"
                />
              </FormGroup>
            </GridItem>
          </Grid>

          <Divider className="pf-v5-u-my-lg" />

          {/* Metadata Filters */}
          <Title headingLevel="h5" className="pf-v5-u-mb-md">
            <TagIcon className="pf-v5-u-mr-sm" />
            Metadata Filters
          </Title>
          
          <Grid hasGutter>
            <GridItem span={6}>
              <FormGroup label="Category">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedCategories}
                  onSelect={(event, selection) => handleCategoryChange(event, selection)}
                  options={categories.map(category => ({
                    value: category,
                    label: category
                  }))}
                  placeholder="Select categories"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Team">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedTeams}
                  onSelect={(event, selection) => handleTeamChange(event, selection)}
                  options={teams.map(team => ({
                    value: team,
                    label: team
                  }))}
                  placeholder="Select teams"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Classification">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedClassifications}
                  onSelect={(event, selection) => handleClassificationChange(event, selection)}
                  options={[
                    { value: "public", label: "Public" },
                    { value: "internal", label: "Internal" },
                    { value: "confidential", label: "Confidential" },
                    { value: "restricted", label: "Restricted" },
                    { value: "secret", label: "Secret" }
                  ]}
                  placeholder="Select classifications"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Environment">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedEnvironments}
                  onSelect={(event, selection) => handleEnvironmentChange(event, selection)}
                  options={[
                    { value: "development", label: "Development" },
                    { value: "staging", label: "Staging" },
                    { value: "production", label: "Production" },
                    { value: "testing", label: "Testing" }
                  ]}
                  placeholder="Select environments"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Priority">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedPriorities}
                  onSelect={(event, selection) => handlePriorityChange(event, selection)}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" }
                  ]}
                  placeholder="Select priorities"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Tags">
                <CustomSelect
                  variant="checkbox"
                  selections={selectedTags}
                  onSelect={(event, selection) => handleTagChange(event, selection)}
                  options={[
                    { value: "database", label: "Database" },
                    { value: "api", label: "API" },
                    { value: "credentials", label: "Credentials" },
                    { value: "certificates", label: "Certificates" },
                    { value: "keys", label: "Keys" }
                  ]}
                  placeholder="Select tags"
                />
              </FormGroup>
            </GridItem>
          </Grid>

          <Divider className="pf-v5-u-my-lg" />

          {/* Date Filters */}
          <Title headingLevel="h5" className="pf-v5-u-mb-md">
            <CalendarIcon className="pf-v5-u-mr-sm" />
            Date Filters
          </Title>
          
          <Grid hasGutter>
            <GridItem span={6}>
                             <FormGroup label="Created After">
                 <DatePicker
                   value={createdAfterDate}
                   onChange={(value) => {
                     setCreatedAfterDate(value);
                     handleDateChange('createdAfter', value);
                   }}
                   placeholder="MM/DD/YYYY"
                 />
               </FormGroup>
            </GridItem>
            <GridItem span={6}>
                             <FormGroup label="Created Before">
                 <DatePicker
                   value={createdBeforeDate}
                   onChange={(value) => {
                     setCreatedBeforeDate(value);
                     handleDateChange('createdBefore', value);
                   }}
                   placeholder="MM/DD/YYYY"
                 />
               </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Updated After">
                <DatePicker
                  value={updatedAfterDate}
                  onChange={(value) => {
                    setUpdatedAfterDate(value);
                    handleDateChange('updatedAfter', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Updated Before">
                <DatePicker
                  value={updatedBeforeDate}
                  onChange={(value) => {
                    setUpdatedBeforeDate(value);
                    handleDateChange('updatedBefore', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Last Rotated After">
                <DatePicker
                  value={lastRotatedAfterDate}
                  onChange={(value) => {
                    setLastRotatedAfterDate(value);
                    handleDateChange('lastRotatedAfter', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Last Rotated Before">
                <DatePicker
                  value={lastRotatedBeforeDate}
                  onChange={(value) => {
                    setLastRotatedBeforeDate(value);
                    handleDateChange('lastRotatedBefore', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
          </Grid>

          {/* Action Buttons */}
          <div className="pf-v5-u-mt-lg">
            <Flex gap={{ default: 'gapMd' }}>
              <Button
                variant={ButtonVariant.secondary}
                onClick={clearFilters}
                icon={<TimesIcon />}
              >
                Clear All Filters
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => setIsExpanded(false)}
              >
                Apply Filters
              </Button>
            </Flex>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
};

export default SecretFilters;
