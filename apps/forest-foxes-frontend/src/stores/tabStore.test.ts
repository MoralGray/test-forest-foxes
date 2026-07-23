import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore } from './tabStore';

describe('tabStore', () => {
    beforeEach(() => {
        useTabStore.setState({ activeTab: 'all' });
    });

    it('initializes with activeTab all', () => {
        expect(useTabStore.getState().activeTab).toBe('all');
    });

    it('setTab changes activeTab', () => {
        useTabStore.getState().setTab('suspicious');
        expect(useTabStore.getState().activeTab).toBe('suspicious');
    });

    it('setTab supports processed tab', () => {
        useTabStore.getState().setTab('processed');
        expect(useTabStore.getState().activeTab).toBe('processed');
    });

    it('setTab supports all tab', () => {
        useTabStore.getState().setTab('suspicious');
        useTabStore.getState().setTab('all');
        expect(useTabStore.getState().activeTab).toBe('all');
    });

    it('resetTab returns to all', () => {
        useTabStore.getState().setTab('processed');
        useTabStore.getState().resetTab();
        expect(useTabStore.getState().activeTab).toBe('all');
    });
});
