<script>
  import DocumentActivityView from '../lib/components/study/DocumentActivityView.svelte';

  export let documentId = '';
  export let documentSection = 'summary';
</script>

<DocumentActivityView {documentId} studyTab={documentSection} />
