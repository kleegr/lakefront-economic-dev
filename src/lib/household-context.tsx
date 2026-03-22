'use client';
import { createContext, useContext } from 'react';

export type HouseholdMember = { id: string; full_name: string; is_primary: boolean; profile_complete: boolean };
export type HouseholdCtx = {
  household: Record<string,unknown>|null;
  members: HouseholdMember[];
  activeMember: HouseholdMember|null;
  setActiveMember: (m:HouseholdMember)=>void;
  approved: boolean;
  reload: ()=>void;
};

export const HouseholdContext = createContext<HouseholdCtx>({
  household:null, members:[], activeMember:null, setActiveMember:()=>{}, approved:false, reload:()=>{}
});

export const useHousehold = () => useContext(HouseholdContext);
