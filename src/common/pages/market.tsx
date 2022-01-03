import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/navbar';
import NavBarElectron from "../../desktop/app/components/navbar";
import { connect } from 'react-redux';
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from './common';
import { ChartStats } from '../components/chart-stats';
import { HiveBarter } from '../components/hive-barter';
import { getMarketStatistics, getOpenOrder, getOrderBook, getTradeHistory, MarketStatistics, OpenOrdersData, OrdersData } from '../api/hive';
import { FullAccount } from '../store/accounts/types';
import { Orders } from '../components/orders';
import { OpenOrders } from '../components/open-orders';
import SSRSuspense from '../components/ssr-suspense';
import { Skeleton } from '../components/skeleton';

const MarketChart = React.lazy(()=> import ("../components/market-chart"));

const MarketPage = (props: PageProps) => {
    const [data, setData] = useState<MarketStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [bidValues, setBidValues] = useState<any>({lowest: 0, highest: 0});
    const [openOrdersdata, setopenOrdersdata] = useState<OpenOrdersData[]>([]);
    const [openOrdersDataLoading, setopenOrdersDataLoading] = useState(false);
    const [tablesData, setTablesData] = useState<OrdersData | null>(null);
    const [loadingTablesData, setLoadingTablesData] = useState(false);
    const {global, activeUser} = props;

    useEffect(()=>{
        setLoading(true);
        setLoadingTablesData(true);
        setopenOrdersDataLoading(true)
        updateData();
        setInterval(()=>updateData(), 20000)
    }, []);

    useEffect(()=>{
        data && setBidValues({lowest: parseFloat(data!.lowest_ask), highest: parseFloat(data!.highest_bid)})
    },[data])

    const updateData = () => {
        getMarketStatistics().then(res=>{
            setLoading(false);
            setData(res)
        });
        getOrderBook().then(res => {
            getTradeHistory().then(trading => {
                setLoadingTablesData(false);
                setTablesData({...res, trading});
            })});
        activeUser && getOpenOrder(activeUser.username).then(res=>{
            setopenOrdersdata(res);
            setopenOrdersDataLoading(false);
        })
    }
    
    let navbar = global.isElectron ?
        NavBarElectron({
            ...props,
            reloadFn: () => {},
            reloading: false,
        }) : <NavBar {...props} />;
        
    return <>
            <div className="d-flex justify-content-center">
                <div className="w-75">
                    <div style={{marginBottom: '6rem'}}>{navbar}</div>
                    <div className='mb-5'>
                        <h2>Title of the page</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla id ligula ac enim tincidunt euismod. Duis eu ex a turpis consequat pharetra. Pellentesque nisl sem, ultricies dignissim vulputate consectetur, facilisis quis felis. Sed neque magna, fringilla et dui a, sodales lacinia sem. Nulla facilisi. Mauris sit amet odio tempor, tristique lectus a, sodales mauris. Praesent gravida sapien eu fringilla tristique. Vestibulum mauris justo, sollicitudin sed magna id, interdum accumsan neque. Donec faucibus felis id ligula vehicula, vitae pulvinar mi sodales. Morbi suscipit cursus justo, interdum ultrices sapien fringilla id. Vestibulum ac odio metus. Sed augue lorem, feugiat in est a, dapibus blandit nisl. Aenean id elit vitae sem eleifend rhoncus id finibus metus. Curabitur in tincidunt dolor, ut tincidunt dolor. Nunc a ultricies tellus, vitae ornare lorem. Mauris sit amet nisi nec sem lobortis semper in at metus.</p>
                    </div>
                    <div className='d-flex justify-content-md-between flex-column flex-md-row'>
                        <div className='mb-5'>
                            <h4 className='mb-3'>{loading ? <Skeleton className='skeleton-loading'/> : "Stock information"}</h4>
                            <ChartStats data={data} loading={loading} />
                        </div>

                        {(data && tablesData) ? <SSRSuspense fallback={<div>Loading chunked component...</div>}>
                                <MarketChart bids={tablesData!.bids || []} asks={tablesData!.asks || []} theme={global.theme} />
                            </SSRSuspense> : "Loading..."}
                    </div>
                    <div className="container my-3">
                        {activeUser && <div className="row justify-content-between">
                            <div className="col-12 col-sm-5 p-0">
                                <HiveBarter
                                    type={1}
                                    available={activeUser && (activeUser.data as FullAccount).balance || ""}
                                    peakValue={parseFloat(bidValues.lowest)}
                                    basePeakValue={data ? parseFloat(data!.lowest_ask): 0}
                                    loading={loading}
                                    username={activeUser!.username}
                                    onClickPeakValue={()=>setBidValues({...bidValues, lowest: data ? parseFloat(data!.lowest_ask): 0})}
                                />
                            </div>
                            <div className="col-12 col-sm-5 p-0">
                                <HiveBarter
                                    type={2}
                                    available={activeUser && (activeUser.data as FullAccount).hbd_balance || ""}
                                    peakValue={parseFloat(bidValues.highest)}
                                    basePeakValue={data ? parseFloat(data!.highest_bid): 0}
                                    loading={loading}
                                    username={activeUser!.username}
                                    onClickPeakValue={()=>setBidValues({...bidValues, highest: data ? parseFloat(data!.highest_bid): 0})}
                                />
                            </div>
                        </div>}

                        <div className="row mt-5">
                            {!openOrdersDataLoading && openOrdersdata.length>0 && <div className="col-12 px-0"><OpenOrders data={openOrdersdata || []} loading={openOrdersDataLoading} username={(activeUser && activeUser.username) || ""}/></div>}
                            <div className="col-12 col-lg-6 pl-sm-0"><Orders onPriceClick={(value)=>setBidValues({...bidValues,lowest:value})} type={1} loading={loadingTablesData} data={tablesData ? tablesData!.bids : []}/></div>
                            <div className="col-12 col-lg-6 pl-0 pl-sm-auto"><Orders onPriceClick={(value)=>setBidValues({...bidValues, highest:value})} type={2} loading={loadingTablesData} data={tablesData ? tablesData!.asks : []}/></div>
                            <div className="col-12 px-0 px-sm-auto mt-5"><Orders type={3} loading={loadingTablesData} data={tablesData ? tablesData!.trading : []}/></div>
                        </div>

                    </div>
                </div>
            </div>
        </>
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);