'use client';
import { Navbar, PageTabs } from '@/components';
import { useBalancesQuery } from '@/hooks';
import { Page, usePage } from '@/store';
import { HomeView, ReceiveView, SendView } from '@/views';

/**
 * WalletView Component
 * @returns 
 */
export const WalletView = () => {
    const page = usePage();
    useBalancesQuery();

    let pageRenderer = null;
    switch (page) {
        case Page.HOME:
            pageRenderer = <HomeView />;
            break;
        case Page.SEND:
            pageRenderer = <SendView />;
            break;
        case Page.RECEIVE:
            pageRenderer = <ReceiveView />;
            break;
    }

    return (
        <>
            <Navbar />
            <div className="container mt-4">{pageRenderer}</div>
            <PageTabs />
        </>
    );
};
