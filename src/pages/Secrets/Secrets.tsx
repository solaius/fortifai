import React, { useState, useEffect } from 'react';
import {
  Title,
  Button,
  ButtonVariant,
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  EmptyState,

  Spinner,
  Pagination,
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  ToolbarFilter,
  ToolbarToggleGroup,
  ToolbarToggleGroupItem
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon } from '@patternfly/react-icons';
import SecretCard from '../../components/Secrets/SecretCard';
import SecretFilters from '../../components/Secrets/SecretFilters';
import { SecretReference, SecretReferenceFilter } from '../../types/secrets';
import { secretsService } from '../../services/secrets';
import { providersService } from '../../services/providers';

const Secrets: React.FC = () => {
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState<SecretReference[]>([]);
  const [filteredSecrets, setFilteredSecrets] = useState<SecretReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SecretReferenceFilter>({});
  const [providers, setProviders] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [namespaces, setNamespaces] = useState<string[]>(['default', 'development', 'staging', 'production']);
  const [projects, setProjects] = useState<string[]>(['frontend', 'backend', 'ml', 'infrastructure']);
  const [teams, setTeams] = useState<string[]>(['platform', 'security', 'devops', 'ml-engineering']);
  const [categories, setCategories] = useState<string[]>(['api-keys', 'database', 'certificates', 'passwords', 'service-accounts']);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [total, setTotal] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load secrets when filter changes
  useEffect(() => {
    loadSecrets();
  }, [filter, page, perPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load providers
      const providerList = await providersService.listProviders();
      setProviders(providerList.map(p => ({ id: p.id, name: p.name, type: p.type })));
      
      // Load secrets
      await loadSecrets();
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecrets = async () => {
    try {
      const result = await secretsService.searchReferences('', filter, page, perPage);
      setSecrets(result.references);
      setFilteredSecrets(result.references);
      setTotal(result.total);
    } catch (error) {
      setError('Failed to load secrets');
      console.error('Error loading secrets:', error);
    }
  };

  const handleFilterChange = (newFilter: SecretReferenceFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilter({});
    setPage(1);
  };

  const handleView = (id: string) => {
    navigate(`/secrets/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/secrets/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this secret reference?')) {
      try {
        await secretsService.deleteReference(id);
        await loadSecrets(); // Reload the list
      } catch (error) {
        setError('Failed to delete secret reference');
        console.error('Error deleting secret:', error);
      }
    }
  };

  const handleCopyReference = (id: string) => {
    navigator.clipboard.writeText(id);
    // You could add a toast notification here
  };

  const handlePageChange = (newPage: number, newPerPage: number) => {
    setPage(newPage);
    setPerPage(newPerPage);
  };

  if (loading) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secrets Catalog
          </Title>
          <p>
            Browse and manage your secret references
          </p>
        </div>
        
        <div className="pf-v5-u-text-align-center pf-v5-u-mt-xl">
          <Spinner size="xl" />
          <p className="pf-v5-u-mt-md">Loading secrets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secrets Catalog
          </Title>
          <p>
            Browse and manage your secret references
          </p>
        </div>
        
        <Alert
          variant={AlertVariant.danger}
          title="Error"
          className="pf-v5-u-mt-md"
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (secrets.length === 0) {
    return (
      <div>
        <div>
          <Title headingLevel="h1" size="2xl">
            Secrets Catalog
          </Title>
          <p>
            Browse and manage your secret references
          </p>
        </div>

        <EmptyState className="pf-v5-u-mt-xl">
          <div className="pf-v5-u-text-align-center">
            <div className="pf-v5-u-mb-md">
              <SearchIcon size="lg" />
            </div>
            <h4>No secret references found</h4>
            <p>Get started by creating your first secret reference from an available provider.</p>
            <Button
              variant={ButtonVariant.primary}
              icon={<PlusIcon />}
              onClick={() => navigate('/secrets/new')}
            >
              Create Secret Reference
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Title headingLevel="h1" size="2xl">
          Secrets Catalog
        </Title>
        <p>
          Browse and manage your secret references
        </p>
      </div>

      {/* Summary Alert */}
      <Alert
        variant={AlertVariant.info}
        title="Secret References Summary"
        className="pf-v5-u-mt-md"
      >
        {filteredSecrets.length} of {total} secret references shown. {secrets.filter(s => s.metadata?.priority === 'high' || s.metadata?.priority === 'critical').length} are high priority.
      </Alert>

      {/* Filters */}
      <SecretFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        providers={providers}
        namespaces={namespaces}
        projects={projects}
        teams={teams}
        categories={categories}
      />

      {/* Toolbar */}
      <Toolbar className="pf-v5-u-mt-md">
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<PlusIcon />}
                onClick={() => navigate('/secrets/new')}
              >
                Create Reference
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarItem>
              <span className="pf-v5-u-color-200">
                {total} total references
              </span>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      {/* Secret Cards */}
      <Grid hasGutter className="pf-v5-u-mt-md">
        {filteredSecrets.map((secret) => (
          <GridItem key={secret.id} span={6}>
            <SecretCard
              secret={secret}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopyReference={handleCopyReference}
            />
          </GridItem>
        ))}
      </Grid>

      {/* Pagination */}
      {total > perPage && (
        <div className="pf-v5-u-mt-lg pf-v5-u-text-align-center">
          <Pagination
            itemCount={total}
            page={page}
            perPage={perPage}
            onSetPage={(event, newPage) => handlePageChange(newPage, perPage)}
            onPerPageSelect={(event, newPerPage) => handlePageChange(1, newPerPage)}
            variant={PaginationVariant.bottom}
            perPageOptions={[
              { title: '12', value: 12 },
              { title: '24', value: 24 },
              { title: '48', value: 48 }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default Secrets;
