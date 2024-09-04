function searchComponent() {
    return {
      query: '',
      open: false,
      products: [],
      suggestions: [],
      loading: false,
      
      searchShopify() {
        if (this.query.length > 0) {
          this.loading = true;
          this.open = true;
  
          axios.get('/search/suggest.json', {
            params: {
              q: this.query,
              resources: {
                type: 'product,collection,query',
                limit: 10,
                options: {
                  unavailable_products: 'last',
                  fields: 'title,body,product_type,variants.title'
                }
              }
            }
          })
          .then((response) => {
            const results = response.data.resources.results;
            
            // Procesar sugerencias
            this.processSuggestions(results);
            
            // Productos - mantener todos los resultados relevantes
            this.products = results.products || [];
  
            this.loading = false;
          })
          .catch(error => {
            console.error('Error en la búsqueda:', error);
            this.loading = false;
          });
        } else {
          this.resetSearch();
        }
      },
  
      processSuggestions(results) {
        const queryLower = this.query.toLowerCase();
        let allSuggestions = [
          ...(results.queries || []).map(q => ({ text: q.text, type: 'popular_query', url: `/search?q=${q.text}` })),
          ...(results.products || []).map(p => ({ text: p.title, type: 'product', url: `/products/${p.handle}` })),
          ...(results.collections || []).map(c => ({ text: c.title, type: 'collection', url: `/collections/${c.handle}` }))
        ];
  
        // Filtrar y ordenar sugerencias
        this.suggestions = allSuggestions
          .filter(item => item.text.toLowerCase().includes(queryLower))
          .sort((a, b) => {
            const aStarts = a.text.toLowerCase().startsWith(queryLower);
            const bStarts = b.text.toLowerCase().startsWith(queryLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
          })
          .slice(0, 7);
  
        // Añadir una sugerencia genérica si hay espacio
        if (this.suggestions.length < 8) {
          this.suggestions.push({ text: `Buscar "${this.query}"`, url: `/search?q=${this.query}`, type: 'generic_search' });
        }
  
        console.log('Sugerencias procesadas:', this.suggestions); // Para depuración
      },
  
      resetSearch() {
        this.open = false;
        this.products = [];
        this.suggestions = [];
      }
    };
  }
  